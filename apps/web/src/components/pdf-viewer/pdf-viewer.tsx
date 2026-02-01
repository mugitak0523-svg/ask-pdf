"use client";

import { useEffect, useRef, useState } from "react";

type PdfViewerProps = {
  url: string;
  documentId: string | null;
  accessToken: string | null;
  onAddToChat?: (text: string) => void;
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
  lineId: number | null;
  left: number;
  top: number;
  width: number;
  height: number;
};

type Annotation = {
  pageNumber: number;
  wordIndex: number;
  color: string;
  mode: "highlight" | "underline";
  createdAt: string;
};

export function PdfViewer({ url, documentId, accessToken, onAddToChat }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<RenderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<Record<number, PageMeta>>({});
  const pageMetaRef = useRef<Record<number, PageMeta>>({});
  const [documentResult, setDocumentResult] = useState<Record<string, unknown> | null>(
    null
  );
  const [annotations, setAnnotations] = useState<
    Record<number, Record<number, Annotation[]>>
  >({});
  const annotationsHydratedRef = useRef(false);
  const wordRectsRef = useRef<Record<number, WordRect[]>>({});
  const selectionRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const selectionDataRef = useRef<{
    startPage: number;
    endPage: number;
    startIndex: number;
    endIndex: number;
    color: string;
    mode: "highlight" | "underline";
    text: string;
    highlights: HTMLDivElement[];
  } | null>(null);
  const currentColorRef = useRef<string>("#ffd84d");
  const currentModeRef = useRef<"highlight" | "underline">("highlight");
  const wordTextRef = useRef<Record<number, { wordIndex: number; text: string }[]>>({});
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
          overlay.dataset.pageNumber = String(pageNum);
          overlay.addEventListener("pointermove", handlePointerMove);
          overlay.addEventListener("pointerleave", handlePointerLeave);
          overlay.addEventListener("pointerdown", handlePointerDown);
          overlay.addEventListener("pointerup", handlePointerUp);
          overlay.addEventListener("pointerdown", (event) => {
            const target = event.target as HTMLElement | null;
            if (target && target.closest(".pdf-embed__popup")) return;
            if (popupRef.current) {
              popupRef.current.remove();
              popupRef.current = null;
            }
          });

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
    const loadAnnotations = async () => {
      if (!documentId || !accessToken) {
        setAnnotations({});
        annotationsHydratedRef.current = false;
        return;
      }
      annotationsHydratedRef.current = false;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/documents/${documentId}/annotations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          setAnnotations({});
          annotationsHydratedRef.current = true;
          return;
        }
        const payload = await response.json();
        const data = payload?.annotations;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setAnnotations(data as Record<number, Record<number, Annotation[]>>);
        } else {
          setAnnotations({});
        }
        annotationsHydratedRef.current = true;
      } catch {
        setAnnotations({});
        annotationsHydratedRef.current = true;
      }
    };
    void loadAnnotations();
  }, [documentId, accessToken]);

  useEffect(() => {
    const saveAnnotations = async () => {
      if (!documentId || !accessToken) return;
      if (!annotationsHydratedRef.current) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        await fetch(`${baseUrl}/documents/${documentId}/annotations`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ annotations }),
        });
      } catch {
        return;
      }
    };
    void saveAnnotations();
  }, [documentId, accessToken, annotations]);

  useEffect(() => {
    renderAllAnnotations();
  }, [annotations, pageMeta, documentId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!selectionDataRef.current) return;
      if (!popupRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (!event.metaKey) return;
      const key = event.key.toLowerCase();
      if (key === "h") {
        event.preventDefault();
        void runPopupAction("highlight");
      } else if (key === "u") {
        event.preventDefault();
        void runPopupAction("underline");
      } else if (key === "c") {
        event.preventDefault();
        void runPopupAction("copy");
      } else if (key === "a") {
        event.preventDefault();
        void runPopupAction("add-to-chat");
      } else if (key === "backspace") {
        event.preventDefault();
        void runPopupAction("delete-annotation");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

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
        const nextWords: Record<number, { wordIndex: number; text: string }[]> = {};

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
          const wordToLine = new Map<number, number>();
          lines.forEach((line, index) => {
            const indexes = Array.isArray(line.word_indexes)
              ? line.word_indexes
              : Array.isArray(line.wordIndexes)
                ? line.wordIndexes
                : [];
            for (const wordIndex of indexes) {
              if (Number.isFinite(wordIndex)) {
                wordToLine.set(Number(wordIndex), index);
              }
            }
          });
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
              lineId: wordToLine.get(wordIndex) ?? null,
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
          nextWords[pageNumber] = words
            .map((word) => ({
              wordIndex: Number(word.word_index ?? word.wordIndex ?? word.index ?? -1),
              text: String(word.content ?? word.text ?? ""),
            }))
            .filter((word) => Number.isFinite(word.wordIndex) && word.wordIndex >= 0)
            .sort((a, b) => a.wordIndex - b.wordIndex);
        }
        for (const key of Object.keys(nextRects)) {
          nextRects[Number(key)].sort((a, b) => a.wordIndex - b.wordIndex);
        }
        wordRectsRef.current = nextRects;
        wordTextRef.current = nextWords;
      } catch {
        setDocumentResult(null);
      }
    };
    void loadResult();
  }, [documentId, accessToken]);

  const handlePointerMove = (event: PointerEvent) => {
    const target = event.currentTarget as HTMLDivElement;
    const pageNumber = Number(target.dataset.pageNumber ?? target.parentElement?.dataset.pageNumber);
    if (!pageNumber) return;
    if (selectionStateRef.current) {
      const overlay = getOverlayFromPoint(event.clientX, event.clientY) ?? target;
      const activePageNumber = Number(
        overlay.dataset.pageNumber ?? overlay.parentElement?.dataset.pageNumber
      );
      if (!activePageNumber) return;
      const rect = overlay.getBoundingClientRect();
      const currentX = event.clientX - rect.left;
      const currentY = event.clientY - rect.top;
      const meta = pageMetaRef.current[activePageNumber];
      const rects = wordRectsRef.current[activePageNumber] || [];
      const startWordIndex = selectionStateRef.current.startWordIndex;
      const startPageNumber = selectionStateRef.current.pageNumber;
      if (meta && rects.length > 0 && startWordIndex !== null) {
        const currentWordIndex =
          findWordIndexAtPoint(rects, meta, currentX, currentY) ??
          findLastWordIndexBeforePoint(rects, meta, currentX, currentY);
        if (currentWordIndex !== null) {
          renderHighlightsAcrossPages(
            startPageNumber,
            startWordIndex,
            activePageNumber,
            currentWordIndex,
            false
          );
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
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    selectionDataRef.current = null;
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
    const startPageNumber = selection.pageNumber;
    const overlay = getOverlayFromPoint(event.clientX, event.clientY) ?? target;
    const endPageNumber = Number(
      overlay.dataset.pageNumber ?? overlay.parentElement?.dataset.pageNumber
    );
    if (!endPageNumber) return;
    const targetRect = overlay.getBoundingClientRect();

    const meta = pageMetaRef.current[endPageNumber];
    const rects = wordRectsRef.current[endPageNumber] || [];
    if (!meta || rects.length === 0) return;

    const currentX = event.clientX - targetRect.left;
    const currentY = event.clientY - targetRect.top;
    const startWordIndex = selection.startWordIndex;
    if (startWordIndex === null) return;
    const currentWordIndex =
      findWordIndexAtPoint(rects, meta, currentX, currentY) ??
      findLastWordIndexBeforePoint(rects, meta, currentX, currentY);
    if (currentWordIndex === null) return;
    renderHighlightsAcrossPages(
      startPageNumber,
      startWordIndex,
      endPageNumber,
      currentWordIndex,
      true
    );
  };

  const renderHighlightsByIndex = (
    target: HTMLDivElement,
    rects: WordRect[],
    meta: PageMeta,
    startIndex: number,
    endIndex: number,
    showPopupAfter: boolean,
    collector?: HTMLDivElement[],
    styleOverride?: { color: string; mode: "highlight" | "underline" }
  ) => {
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    target.querySelectorAll(".pdf-embed__highlight").forEach((node) => node.remove());
    let bounds: { left: number; top: number; right: number; bottom: number } | null =
      null;
    const selected = rects.filter(
      (rect) => rect.wordIndex >= minIndex && rect.wordIndex <= maxIndex
    );
    const groups = groupRectsByLine(selected);
    for (const group of groups) {
      const left = group.left * meta.width;
      const top = group.top * meta.height;
      const right = (group.left + group.width) * meta.width;
      const bottom = (group.top + group.height) * meta.height;
      if (!bounds) {
        bounds = { left, top, right, bottom };
      } else {
        bounds.left = Math.min(bounds.left, left);
        bounds.top = Math.min(bounds.top, top);
        bounds.right = Math.max(bounds.right, right);
        bounds.bottom = Math.max(bounds.bottom, bottom);
      }
      const highlight = document.createElement("div");
      highlight.className = "pdf-embed__highlight";
      highlight.style.left = `${left}px`;
      highlight.style.top = `${top}px`;
      highlight.style.width = `${right - left}px`;
      highlight.style.height = `${bottom - top}px`;
      const styleColor = styleOverride?.color ?? currentColorRef.current;
      const styleMode = styleOverride?.mode ?? currentModeRef.current;
      applyHighlightStyle(highlight, styleColor, styleMode);
      target.appendChild(highlight);
      if (collector) collector.push(highlight);
    }
    if (bounds && showPopupAfter) {
      const anchor = getWordAnchor(rects, meta, endIndex);
      showPopup(target, bounds, anchor ?? undefined);
    }
  };

  const renderHighlightsAcrossPages = (
    startPage: number,
    startIndex: number,
    endPage: number,
    endIndex: number,
    showPopupAfter: boolean
  ) => {
    clearAllHighlights();
    const highlights: HTMLDivElement[] = [];
    const pages = Object.keys(wordRectsRef.current)
      .map((key) => Number(key))
      .filter((page) => Number.isFinite(page))
      .sort((a, b) => a - b);
    if (pages.length === 0) return;
    const forward = startPage <= endPage;
    const fromPage = forward ? startPage : endPage;
    const toPage = forward ? endPage : startPage;
    for (const pageNumber of pages) {
      if (pageNumber < fromPage || pageNumber > toPage) continue;
      const rects = wordRectsRef.current[pageNumber] || [];
      const meta = pageMetaRef.current[pageNumber];
      const overlay = getOverlayForPage(pageNumber);
      if (!rects.length || !meta || !overlay) continue;
      const [rangeStart, rangeEnd] = getPageSelectionRange(
        rects,
        pageNumber,
        startPage,
        startIndex,
        endPage,
        endIndex
      );
      renderHighlightsByIndex(
        overlay,
        rects,
        meta,
        rangeStart,
        rangeEnd,
        false,
        highlights,
        { color: "#6aa9ff", mode: "highlight" }
      );
    }
    const selectedText = getSelectedTextAcrossPages(
      startPage,
      startIndex,
      endPage,
      endIndex
    );
    selectionDataRef.current = {
      startPage,
      endPage,
      startIndex,
      endIndex,
      color: currentColorRef.current,
      mode: currentModeRef.current,
      text: selectedText,
      highlights,
    };
    if (showPopupAfter) {
      const targetPage = endPage;
      const rects = wordRectsRef.current[targetPage] || [];
      const meta = pageMetaRef.current[targetPage];
      const overlay = getOverlayForPage(targetPage);
      if (rects.length && meta && overlay) {
        const [rangeStart, rangeEnd] = getPageSelectionRange(
          rects,
          targetPage,
          startPage,
          startIndex,
          endPage,
          endIndex
        );
        const anchorIndex = rangeEnd;
        const selected = rects.filter(
          (rect) => rect.wordIndex >= rangeStart && rect.wordIndex <= rangeEnd
        );
        let bounds: { left: number; top: number; right: number; bottom: number } | null =
          null;
        const groups = groupRectsByLine(selected);
        for (const group of groups) {
          const left = group.left * meta.width;
          const top = group.top * meta.height;
          const right = (group.left + group.width) * meta.width;
          const bottom = (group.top + group.height) * meta.height;
          if (!bounds) {
            bounds = { left, top, right, bottom };
          } else {
            bounds.left = Math.min(bounds.left, left);
            bounds.top = Math.min(bounds.top, top);
            bounds.right = Math.max(bounds.right, right);
            bounds.bottom = Math.max(bounds.bottom, bottom);
          }
        }
        if (bounds) {
          const anchor = getWordAnchor(rects, meta, anchorIndex);
          showPopup(overlay, bounds, anchor ?? undefined);
        }
      }
    }
  };

  const showPopup = (
    target: HTMLDivElement,
    bounds: { left: number; top: number; right: number; bottom: number },
    anchor?: { x: number; y: number }
  ) => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    const popup = document.createElement("div");
    popup.className = "pdf-embed__popup";
    popup.innerHTML = `
      <div class="pdf-embed__popup-palette" aria-label="Highlight colors">
        <button type="button" class="pdf-embed__palette-color is-selected" style="--swatch:#ffd84d" data-color="#ffd84d">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#ffb347" data-color="#ffb347">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#ff7b7b" data-color="#ff7b7b">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#ff8bd1" data-color="#ff8bd1">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#b28cff" data-color="#b28cff">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#7aa9ff" data-color="#7aa9ff">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#69d2ff" data-color="#69d2ff">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#65e0a1" data-color="#65e0a1">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#c7ea6b" data-color="#c7ea6b">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
        <button type="button" class="pdf-embed__palette-color" style="--swatch:#ffe4a3" data-color="#ffe4a3">
          <span class="pdf-embed__palette-check">✓</span>
        </button>
      </div>
      <button type="button" class="pdf-embed__popup-btn" data-action="highlight">
        <svg class="pdf-embed__popup-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12 12) scale(1.1) translate(-12 -12)">
            <path
              d="M4 16.5V20h3.5L18.8 8.7l-3.5-3.5L4 16.5z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <path
              d="M13.8 5.2l3.5 3.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </svg>
        Highlight
        <span class="pdf-embed__popup-shortcut">
          <span class="pdf-embed__popup-key">⌘</span>
          <span class="pdf-embed__popup-key">H</span>
        </span>
      </button>
      <button type="button" class="pdf-embed__popup-btn" data-action="underline">
        <svg class="pdf-embed__popup-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12 12) scale(1.1) translate(-12 -12)">
            <path
              d="M8 4v7a4 4 0 0 0 8 0V4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              d="M5 20h14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </svg>
        Underline
        <span class="pdf-embed__popup-shortcut">
          <span class="pdf-embed__popup-key">⌘</span>
          <span class="pdf-embed__popup-key">U</span>
        </span>
      </button>
      <button type="button" class="pdf-embed__popup-btn" data-action="copy">
        <svg class="pdf-embed__popup-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12 12) scale(1.1) translate(-12 -12)">
            <rect
              x="8"
              y="8"
              width="10"
              height="10"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M6 16H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </svg>
        Copy
        <span class="pdf-embed__popup-shortcut">
          <span class="pdf-embed__popup-key">⌘</span>
          <span class="pdf-embed__popup-key">C</span>
        </span>
      </button>
      <button type="button" class="pdf-embed__popup-btn" data-action="add-to-chat">
        <svg class="pdf-embed__popup-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12 12) scale(1.1) translate(-12 -12)">
            <path
              d="M4 8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9l-4 3v-3H7a3 3 0 0 1-3-3V8z"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linejoin="round"
            />
            <path
              d="M12 9v6M9 12h6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </g>
        </svg>
        Add to chat
        <span class="pdf-embed__popup-shortcut">
          <span class="pdf-embed__popup-key">⌘</span>
          <span class="pdf-embed__popup-key">A</span>
        </span>
      </button>
      <button
        type="button"
        class="pdf-embed__popup-btn pdf-embed__popup-btn--danger"
        data-action="delete-annotation"
      >
        <svg class="pdf-embed__popup-icon" viewBox="0 0 24 24" aria-hidden="true">
          <g transform="translate(12 12) scale(1.1) translate(-12 -12)">
            <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
            <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
            <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></line>
          </g>
        </svg>
        Delete annotation
        <span class="pdf-embed__popup-shortcut">
          <span class="pdf-embed__popup-key">⌘</span>
          <span class="pdf-embed__popup-key">⌫</span>
        </span>
      </button>
    `;
    target.appendChild(popup);
    const { width: popupWidth, height: popupHeight } = popup.getBoundingClientRect();
    const maxLeft = Math.max(6, target.clientWidth - popupWidth - 6);
    const maxTop = Math.max(6, target.clientHeight - popupHeight - 6);
    const anchorX = anchor ? anchor.x : bounds.right;
    const anchorY = anchor ? anchor.y : bounds.bottom;
    const left = Math.max(6, Math.min(anchorX + 8, maxLeft));
    const top = Math.max(6, Math.min(anchorY + 8, maxTop));
    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
    popupRef.current = popup;
    bindPopupActions(popup);
    popup.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    const paletteButtons = popup.querySelectorAll<HTMLButtonElement>(
      ".pdf-embed__palette-color"
    );
    paletteButtons.forEach((button) => {
      if (button.dataset.color === currentColorRef.current) {
        button.classList.add("is-selected");
      } else {
        button.classList.remove("is-selected");
      }
    });
  };

  const getWordAnchor = (rects: WordRect[], meta: PageMeta, wordIndex: number) => {
    const rect = rects.find((item) => item.wordIndex === wordIndex);
    if (!rect) return null;
    return {
      x: (rect.left + rect.width) * meta.width,
      y: (rect.top + rect.height) * meta.height,
    };
  };

  const applyHighlightStyle = (
    element: HTMLDivElement,
    color: string,
    mode: "highlight" | "underline"
  ) => {
    if (mode === "underline") {
      element.style.background = "transparent";
      element.style.borderBottom = `2px solid ${color}`;
    } else {
      element.style.borderBottom = "none";
      element.style.background = colorToRgba(color, 0.35);
    }
  };

  const colorToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace("#", "");
    if (normalized.length !== 6) return `rgba(255, 214, 0, ${alpha})`;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const bindPopupActions = (popup: HTMLDivElement) => {
    const palettes = Array.from(
      popup.querySelectorAll<HTMLButtonElement>(".pdf-embed__palette-color")
    );
    palettes.forEach((button) => {
      button.addEventListener("click", () => {
        const color = button.dataset.color;
        if (!color) return;
        currentColorRef.current = color;
        palettes.forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        if (selectionDataRef.current) {
          selectionDataRef.current.color = color;
        }
      });
    });

    const buttons = popup.querySelectorAll<HTMLButtonElement>(".pdf-embed__popup-btn");
    buttons.forEach((button) => {
      const action = button.dataset.action;
      if (!action) return;
      button.addEventListener("click", async () => {
        await runPopupAction(action);
      });
    });
  };

  const runPopupAction = async (action: string) => {
    const selection = selectionDataRef.current;
    if (!selection) return;
    if (action === "highlight" || action === "underline") {
      const mode = action === "highlight" ? "highlight" : "underline";
      const chosenColor = currentColorRef.current;
      currentModeRef.current = mode;
      selection.mode = mode;
      selection.color = chosenColor;
      selection.highlights.forEach((highlight) => {
        applyHighlightStyle(highlight, chosenColor, mode);
      });
      const updates = getSelectedWordIndicesAcrossPages(
        selection.startPage,
        selection.startIndex,
        selection.endPage,
        selection.endIndex
      );
      const timestamp = new Date().toISOString();
      setAnnotations((prev) => {
        const next: Record<number, Record<number, Annotation[]>> = { ...prev };
        for (const [pageKey, wordIndexes] of Object.entries(updates)) {
          const pageNumber = Number(pageKey);
          if (!Number.isFinite(pageNumber)) continue;
          const pageMap: Record<number, Annotation[]> = { ...(next[pageNumber] ?? {}) };
          for (const wordIndex of wordIndexes) {
            const entry: Annotation = {
              pageNumber,
              wordIndex,
              color: chosenColor,
              mode,
              createdAt: timestamp,
            };
            const existing = pageMap[wordIndex] ?? [];
            const filtered = existing.filter((item) => item.mode !== mode);
            pageMap[wordIndex] = [...filtered, entry];
          }
          next[pageNumber] = pageMap;
        }
        return next;
      });
      selection.highlights.forEach((highlight) => highlight.remove());
      selectionDataRef.current = null;
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }
    if (action === "copy") {
      if (selection.text) {
        await navigator.clipboard.writeText(selection.text);
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }
    if (action === "add-to-chat") {
      if (selection.text && onAddToChat) {
        onAddToChat(selection.text);
      }
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      return;
    }
    if (action === "delete-annotation") {
      const updates = getSelectedWordIndicesAcrossPages(
        selection.startPage,
        selection.startIndex,
        selection.endPage,
        selection.endIndex
      );
      setAnnotations((prev) => {
        const next: Record<number, Record<number, Annotation[]>> = { ...prev };
        for (const [pageKey, wordIndexes] of Object.entries(updates)) {
          const pageNumber = Number(pageKey);
          if (!Number.isFinite(pageNumber)) continue;
          const pageMap: Record<number, Annotation[]> = { ...(next[pageNumber] ?? {}) };
          for (const wordIndex of wordIndexes) {
            const existing = pageMap[wordIndex] ?? [];
            if (existing.length === 0) continue;
            const sorted = [...existing].sort(
              (a, b) => a.createdAt.localeCompare(b.createdAt)
            );
            sorted.pop();
            if (sorted.length === 0) {
              delete pageMap[wordIndex];
            } else {
              pageMap[wordIndex] = sorted;
            }
          }
          if (Object.keys(pageMap).length === 0) {
            delete next[pageNumber];
          } else {
            next[pageNumber] = pageMap;
          }
        }
        return next;
      });
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  };

  const getPageSelectionRange = (
    rects: WordRect[],
    pageNumber: number,
    startPage: number,
    startIndex: number,
    endPage: number,
    endIndex: number
  ) => {
    const firstIndex = rects[0].wordIndex;
    const lastIndex = rects[rects.length - 1].wordIndex;
    if (startPage === endPage) {
      return [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    }
    if (startPage < endPage) {
      if (pageNumber === startPage) return [startIndex, lastIndex];
      if (pageNumber === endPage) return [firstIndex, endIndex];
      return [firstIndex, lastIndex];
    }
    if (pageNumber === startPage) return [firstIndex, startIndex];
    if (pageNumber === endPage) return [endIndex, lastIndex];
    return [firstIndex, lastIndex];
  };

  const getSelectedTextAcrossPages = (
    startPage: number,
    startIndex: number,
    endPage: number,
    endIndex: number
  ) => {
    const pages = Object.keys(wordTextRef.current)
      .map((key) => Number(key))
      .filter((page) => Number.isFinite(page))
      .sort((a, b) => a - b);
    if (pages.length === 0) return "";
    const forward = startPage <= endPage;
    const fromPage = forward ? startPage : endPage;
    const toPage = forward ? endPage : startPage;
    const parts: string[] = [];
    for (const pageNumber of pages) {
      if (pageNumber < fromPage || pageNumber > toPage) continue;
      const words = wordTextRef.current[pageNumber] || [];
      if (words.length === 0) continue;
      const [rangeStart, rangeEnd] = getPageSelectionRange(
        words.map((word) => ({ wordIndex: word.wordIndex } as WordRect)),
        pageNumber,
        startPage,
        startIndex,
        endPage,
        endIndex
      );
      const text = words
        .filter((word) => word.wordIndex >= rangeStart && word.wordIndex <= rangeEnd)
        .map((word) => word.text)
        .join(" ");
      if (text) parts.push(text);
    }
    return parts.join("\n");
  };

  const getSelectedWordIndicesAcrossPages = (
    startPage: number,
    startIndex: number,
    endPage: number,
    endIndex: number
  ) => {
    const normalized = normalizeSelectionRange(
      startPage,
      startIndex,
      endPage,
      endIndex
    );
    const pages = Object.keys(wordRectsRef.current)
      .map((key) => Number(key))
      .filter((page) => Number.isFinite(page))
      .sort((a, b) => a - b);
    const result: Record<number, number[]> = {};
    for (const pageNumber of pages) {
      if (pageNumber < normalized.startPage || pageNumber > normalized.endPage) continue;
      const rects = wordRectsRef.current[pageNumber] || [];
      if (!rects.length) continue;
      const [rangeStart, rangeEnd] = getPageSelectionRange(
        rects,
        pageNumber,
        normalized.startPage,
        normalized.startIndex,
        normalized.endPage,
        normalized.endIndex
      );
      const wordIndexes = rects
        .filter((rect) => rect.wordIndex >= rangeStart && rect.wordIndex <= rangeEnd)
        .map((rect) => rect.wordIndex);
      if (wordIndexes.length) {
        result[pageNumber] = wordIndexes;
      }
    }
    return result;
  };

  const normalizeSelectionRange = (
    startPage: number,
    startIndex: number,
    endPage: number,
    endIndex: number
  ) => {
    if (startPage < endPage) {
      return { startPage, startIndex, endPage, endIndex };
    }
    if (startPage > endPage) {
      return {
        startPage: endPage,
        startIndex: endIndex,
        endPage: startPage,
        endIndex: startIndex,
      };
    }
    return {
      startPage,
      startIndex: Math.min(startIndex, endIndex),
      endPage,
      endIndex: Math.max(startIndex, endIndex),
    };
  };

  const clearAllHighlights = () => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll(".pdf-embed__highlight")
      .forEach((node) => node.remove());
  };

  const clearAllAnnotations = () => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll(".pdf-embed__annotation")
      .forEach((node) => node.remove());
  };

  const renderAnnotationGroups = (
    overlay: HTMLDivElement,
    rects: WordRect[],
    meta: PageMeta,
    entries: Record<number, Annotation[]>
  ) => {
    const expanded: { rect: WordRect; entry: Annotation }[] = [];
    for (const rect of rects) {
      const list = entries[rect.wordIndex];
      if (!list || list.length === 0) continue;
      for (const entry of list) {
        expanded.push({ rect, entry });
      }
    }
    if (!expanded.length) return;
    const sorted = expanded.sort((a, b) => {
      const lineA = a.rect.lineId ?? a.rect.top;
      const lineB = b.rect.lineId ?? b.rect.top;
      if (lineA !== lineB) return lineA - lineB;
      if (a.entry.mode !== b.entry.mode) {
        return a.entry.mode === "highlight" ? -1 : 1;
      }
      if (a.entry.color !== b.entry.color) {
        return a.entry.color.localeCompare(b.entry.color);
      }
      return a.rect.left - b.rect.left;
    });
    let current = sorted[0];
    let group = {
      left: current.rect.left,
      top: current.rect.top,
      width: current.rect.width,
      height: current.rect.height,
      lineId: current.rect.lineId ?? current.rect.top,
      color: current.entry.color,
      mode: current.entry.mode,
      lastWordIndex: current.rect.wordIndex,
    };
    const flush = () => {
      const left = group.left * meta.width;
      const top = group.top * meta.height;
      const right = (group.left + group.width) * meta.width;
      const bottom = (group.top + group.height) * meta.height;
      const highlight = document.createElement("div");
      highlight.className = "pdf-embed__annotation";
      highlight.style.left = `${left}px`;
      highlight.style.top = `${top}px`;
      highlight.style.width = `${right - left}px`;
      highlight.style.height = `${bottom - top}px`;
      applyHighlightStyle(highlight, group.color, group.mode);
      overlay.appendChild(highlight);
    };
    for (let i = 1; i < sorted.length; i += 1) {
      const next = sorted[i];
      const nextLine = next.rect.lineId ?? next.rect.top;
      const sameLine = nextLine === group.lineId;
      const sameStyle = next.entry.color === group.color && next.entry.mode === group.mode;
      const isAdjacent = next.rect.wordIndex === group.lastWordIndex + 1;
      if (sameLine && sameStyle && isAdjacent) {
        const newLeft = Math.min(group.left, next.rect.left);
        const newRight = Math.max(
          group.left + group.width,
          next.rect.left + next.rect.width
        );
        group.left = newLeft;
        group.width = newRight - newLeft;
        group.height = Math.max(group.height, next.rect.height);
        group.lastWordIndex = next.rect.wordIndex;
      } else {
        flush();
        group = {
          left: next.rect.left,
          top: next.rect.top,
          width: next.rect.width,
          height: next.rect.height,
          lineId: nextLine,
          color: next.entry.color,
          mode: next.entry.mode,
          lastWordIndex: next.rect.wordIndex,
        };
      }
    }
    flush();
  };

  function renderAllAnnotations() {
    if (!containerRef.current) return;
    clearAllAnnotations();
    const pages = Object.keys(annotations)
      .map((key) => Number(key))
      .filter((page) => Number.isFinite(page))
      .sort((a, b) => a - b);
    for (const pageNumber of pages) {
      const rects = wordRectsRef.current[pageNumber] || [];
      const meta = pageMetaRef.current[pageNumber];
      const overlay = getOverlayForPage(pageNumber);
      if (!rects.length || !meta || !overlay) continue;
      const entries = annotations[pageNumber] ?? {};
      renderAnnotationGroups(overlay, rects, meta, entries);
    }
  }

  const getOverlayForPage = (pageNumber: number) => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector(
      `.pdf-embed__overlay[data-page-number="${pageNumber}"]`
    ) as HTMLDivElement | null;
  };

  const getOverlayFromPoint = (x: number, y: number) => {
    const element = document.elementFromPoint(x, y);
    if (!element) return null;
    return element.closest(".pdf-embed__overlay") as HTMLDivElement | null;
  };

  const groupRectsByLine = (rects: WordRect[]) => {
    if (rects.length === 0) return [];
    const sorted = [...rects].sort(
      (a, b) =>
        (a.lineId ?? 0) - (b.lineId ?? 0) ||
        a.top - b.top ||
        a.left - b.left
    );
    const groups: WordRect[] = [];
    let current = { ...sorted[0] };
    for (let i = 1; i < sorted.length; i += 1) {
      const rect = sorted[i];
      const sameLine = rect.lineId !== null && rect.lineId === current.lineId;
      if (sameLine) {
        const newLeft = Math.min(current.left, rect.left);
        const newRight = Math.max(
          current.left + current.width,
          rect.left + rect.width
        );
        current.left = newLeft;
        current.width = newRight - newLeft;
        current.height = Math.max(current.height, rect.height);
      } else {
        groups.push(current);
        current = { ...rect };
      }
    }
    groups.push(current);
    return groups;
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
