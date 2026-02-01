"use client";

import { useEffect, useRef, useState } from "react";

type PdfViewerProps = {
  url: string;
  documentId: string | null;
  accessToken: string | null;
};

type RenderState = "idle" | "loading" | "error";

type PageMeta = {
  width: number;
  height: number;
  widthInch: number;
  heightInch: number;
};

type WordRect = {
  wordIndex: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function PdfViewer({ url, documentId, accessToken }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<RenderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<Record<number, PageMeta>>({});
  const pageMetaRef = useRef<Record<number, PageMeta>>({});
  const [documentResult, setDocumentResult] = useState<Record<string, unknown> | null>(
    null
  );
  const wordRectsRef = useRef<Record<number, WordRect[]>>({});
  const selectionRef = useRef<HTMLDivElement | null>(null);
  const selectionStateRef = useRef<{
    pageNumber: number;
    startX: number;
    startY: number;
    startWordIndex: number | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setState("loading");
      setErrorMessage(null);
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const containerWidth = container.clientWidth || 720;

        const nextMeta: Record<number, PageMeta> = {};
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: 1 });
          const pageWidth = Math.min(containerWidth, 900);
          const scale = pageWidth / viewport.width;
          const scaled = page.getViewport({ scale });

          const pageWrapper = document.createElement("div");
          pageWrapper.className = "pdf-embed__page";
          pageWrapper.dataset.pageNumber = String(pageNum);
          pageWrapper.style.width = `${Math.floor(scaled.width)}px`;
          pageWrapper.style.margin = "0 auto";

          const canvas = document.createElement("canvas");
          canvas.className = "pdf-embed__canvas";
          canvas.width = Math.floor(scaled.width);
          canvas.height = Math.floor(scaled.height);

          const overlay = document.createElement("div");
          overlay.className = "pdf-embed__overlay";
          overlay.style.width = `${Math.floor(scaled.width)}px`;
          overlay.style.height = `${Math.floor(scaled.height)}px`;
          overlay.addEventListener("pointermove", handlePointerMove);
          overlay.addEventListener("pointerleave", handlePointerLeave);
          overlay.addEventListener("pointerdown", handlePointerDown);
          overlay.addEventListener("pointerup", handlePointerUp);

          pageWrapper.appendChild(canvas);
          pageWrapper.appendChild(overlay);
          container.appendChild(pageWrapper);

          const context = canvas.getContext("2d");
          if (!context) continue;
          await page.render({ canvasContext: context, viewport: scaled }).promise;

          const existing = pageMetaRef.current[pageNum];
          nextMeta[pageNum] = {
            width: Math.floor(scaled.width),
            height: Math.floor(scaled.height),
            widthInch:
              existing?.widthInch && existing.widthInch > 0
                ? existing.widthInch
                : viewport.width,
            heightInch:
              existing?.heightInch && existing.heightInch > 0
                ? existing.heightInch
                : viewport.height,
          };
        }

        if (!cancelled) {
          setPageMeta(nextMeta);
          setState("idle");
        }
      } catch (error) {
        if (!cancelled) {
          setState("error");
          const message =
            error instanceof Error ? error.message : "PDFを表示できませんでした";
          setErrorMessage(message);
        }
      }
    };

    void render();
    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [url]);

  useEffect(() => {
    pageMetaRef.current = pageMeta;
  }, [pageMeta]);

  useEffect(() => {
    const loadResult = async () => {
      if (!documentId || !accessToken) {
        setDocumentResult(null);
        return;
      }
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/documents/${documentId}/result`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) return;
        const result = await response.json();
        setDocumentResult(result);
        const pages = Array.isArray(result.pages) ? result.pages : [];
        if (pages.length > 0) {
          setPageMeta((prev) => {
            const merged = { ...prev };
            for (const page of pages) {
              const pageNumber = Number(page.pageNumber ?? page.page_number);
              if (!pageNumber) continue;
              const widthInch = Number(page.width ?? page.widthInch);
              const heightInch = Number(page.height ?? page.heightInch);
              merged[pageNumber] = {
                width: prev[pageNumber]?.width ?? 0,
                height: prev[pageNumber]?.height ?? 0,
                widthInch: Number.isFinite(widthInch) ? widthInch : prev[pageNumber]?.widthInch ?? 0,
                heightInch: Number.isFinite(heightInch) ? heightInch : prev[pageNumber]?.heightInch ?? 0,
              };
            }
            return merged;
          });
        }

        const nextRects: Record<number, WordRect[]> = {};

        const polygonToRect = (polygon: number[]) => {
          const xs = [];
          const ys = [];
          for (let i = 0; i < polygon.length; i += 2) {
            xs.push(polygon[i]);
            ys.push(polygon[i + 1]);
          }
          const left = Math.min(...xs);
          const right = Math.max(...xs);
          const top = Math.min(...ys);
          const bottom = Math.max(...ys);
          return { left, top, width: right - left, height: bottom - top };
        };

        for (const page of pages) {
          const pageNumber = Number(page.pageNumber ?? page.page_number);
          const width = Number(page.width ?? page.widthInch);
          const height = Number(page.height ?? page.heightInch);
          if (!pageNumber || !Number.isFinite(width) || !Number.isFinite(height)) continue;
          const words = Array.isArray(page.words) ? page.words : [];
          const lines = Array.isArray(page.lines) ? page.lines : [];
          for (const word of words) {
            if (!Array.isArray(word.polygon)) continue;
            const rect = polygonToRect(word.polygon);
            const wordIndex = Number(word.word_index ?? word.wordIndex);
            if (!Number.isFinite(wordIndex)) continue;
            const matched = (() => {
              for (const line of lines) {
                const indexes = Array.isArray(line.word_indexes)
                  ? line.word_indexes
                  : Array.isArray(line.wordIndexes)
                    ? line.wordIndexes
                    : [];
                if (indexes.includes(wordIndex)) {
                  if (!Array.isArray(line.polygon)) return null;
                  const lineRect = polygonToRect(line.polygon);
                  return {
                    top: lineRect.top / height,
                    height: lineRect.height / height,
                  };
                }
              }
              return null;
            })();
            if (!nextRects[pageNumber]) nextRects[pageNumber] = [];
            const normalized = {
              wordIndex,
              left: rect.left / width,
              top: rect.top / height,
              width: rect.width / width,
              height: rect.height / height,
            };
            if (matched) {
              normalized.top = matched.top;
              normalized.height = matched.height;
            }
            nextRects[pageNumber].push(normalized);
          }
        }
        for (const key of Object.keys(nextRects)) {
          nextRects[Number(key)].sort((a, b) => a.wordIndex - b.wordIndex);
        }
        wordRectsRef.current = nextRects;
      } catch {
        setDocumentResult(null);
      }
    };
    void loadResult();
  }, [documentId, accessToken]);

  const handlePointerMove = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    const pageNumber = Number(target.parentElement?.dataset.pageNumber);
    if (!pageNumber) return;
    if (selectionStateRef.current && selectionStateRef.current.pageNumber === pageNumber) {
      const rect = target.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;
      const startX = selectionStateRef.current.startX;
      const startY = selectionStateRef.current.startY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      void left;
      void top;
      void width;
      void height;
      const meta = pageMetaRef.current[pageNumber];
      const rects = wordRectsRef.current[pageNumber] || [];
      const startWordIndex = selectionStateRef.current.startWordIndex;
      if (meta && rects.length > 0 && startWordIndex !== null) {
        const currentWordIndex =
          findWordIndexAtPoint(rects, meta, currentX, currentY) ??
          findLastWordIndexBeforePoint(rects, meta, currentX, currentY);
        if (currentWordIndex !== null) {
          renderHighlightsByIndex(target, rects, meta, startWordIndex, currentWordIndex);
        }
      }
      return;
    }
    const meta = pageMetaRef.current[pageNumber];
    const rects = wordRectsRef.current[pageNumber] || [];
    if (!meta || rects.length === 0) {
      target.style.cursor = "default";
      return;
    }
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = rects.some((rect) => {
      const left = rect.left * meta.width;
      const top = rect.top * meta.height;
      const right = (rect.left + rect.width) * meta.width;
      const bottom = (rect.top + rect.height) * meta.height;
      return x >= left && x <= right && y >= top && y <= bottom;
    });
    target.style.cursor = hit ? "text" : "default";
  };

  const handlePointerLeave = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    target.style.cursor = "default";
  };

  const handlePointerDown = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    const pageNumber = Number(target.parentElement?.dataset.pageNumber);
    if (!pageNumber) return;
    const rect = target.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    target.querySelectorAll(".pdf-embed__highlight").forEach((node) => node.remove());
    selectionRef.current = null;
    const meta = pageMetaRef.current[pageNumber];
    const rects = wordRectsRef.current[pageNumber] || [];
    const startWordIndex =
      meta && rects.length > 0 ? findWordIndexAtPoint(rects, meta, startX, startY) : null;
    selectionStateRef.current = { pageNumber, startX, startY, startWordIndex };
    target.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    target.releasePointerCapture(event.pointerId);
    const selection = selectionStateRef.current;
    if (!selection) return;
    selectionRef.current = null;
    selectionStateRef.current = null;
    const pageNumber = selection.pageNumber;
    const targetRect = target.getBoundingClientRect();

    const meta = pageMetaRef.current[pageNumber];
    const rects = wordRectsRef.current[pageNumber] || [];
    if (!meta || rects.length === 0) return;

    const currentX = event.clientX - targetRect.left;
    const currentY = event.clientY - targetRect.top;
    const startWordIndex = selection.startWordIndex;
    if (startWordIndex === null) return;
    const currentWordIndex =
      findWordIndexAtPoint(rects, meta, currentX, currentY) ??
      findLastWordIndexBeforePoint(rects, meta, currentX, currentY);
    if (currentWordIndex === null) return;
    renderHighlightsByIndex(target, rects, meta, startWordIndex, currentWordIndex);
  };

  const renderHighlightsByIndex = (
    target: HTMLDivElement,
    rects: WordRect[],
    meta: PageMeta,
    startIndex: number,
    endIndex: number
  ) => {
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    target.querySelectorAll(".pdf-embed__highlight").forEach((node) => node.remove());
    for (const rectItem of rects) {
      if (rectItem.wordIndex >= minIndex && rectItem.wordIndex <= maxIndex) {
        const left = rectItem.left * meta.width;
        const top = rectItem.top * meta.height;
        const right = (rectItem.left + rectItem.width) * meta.width;
        const bottom = (rectItem.top + rectItem.height) * meta.height;
        const highlight = document.createElement("div");
        highlight.className = "pdf-embed__highlight";
        highlight.style.left = `${left}px`;
        highlight.style.top = `${top}px`;
        highlight.style.width = `${right - left}px`;
        highlight.style.height = `${bottom - top}px`;
        target.appendChild(highlight);
      }
    }
  };

  const findWordIndexAtPoint = (
    rects: WordRect[],
    meta: PageMeta,
    x: number,
    y: number
  ) => {
    for (const rectItem of rects) {
      const left = rectItem.left * meta.width;
      const top = rectItem.top * meta.height;
      const right = (rectItem.left + rectItem.width) * meta.width;
      const bottom = (rectItem.top + rectItem.height) * meta.height;
      if (x >= left && x <= right && y >= top && y <= bottom) {
        return rectItem.wordIndex;
      }
    }
    return null;
  };

  const findLastWordIndexBeforePoint = (
    rects: WordRect[],
    meta: PageMeta,
    x: number,
    y: number
  ) => {
    let bestIndex: number | null = null;
    for (const rectItem of rects) {
      const left = rectItem.left * meta.width;
      const top = rectItem.top * meta.height;
      const right = (rectItem.left + rectItem.width) * meta.width;
      const bottom = (rectItem.top + rectItem.height) * meta.height;
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      if (centerY <= y && centerX <= x) {
        if (bestIndex === null || rectItem.wordIndex > bestIndex) {
          bestIndex = rectItem.wordIndex;
        }
      }
    }
    return bestIndex;
  };


  return (
    <div className="pdf-embed">
      {state === "loading" ? (
        <div className="empty-state">PDFを読み込み中...</div>
      ) : null}
      {state === "error" ? (
        <div className="empty-state">
          PDFの表示に失敗しました
          {errorMessage ? <span className="pdf-embed__error">{errorMessage}</span> : null}
        </div>
      ) : null}
      <div ref={containerRef} className="pdf-embed__pages" />
    </div>
  );
}
