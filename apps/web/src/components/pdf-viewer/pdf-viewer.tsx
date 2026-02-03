"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type PdfViewerProps = {
  url: string;
  documentId: string | null;
  accessToken: string | null;
  onAddToChat?: (text: string) => void;
  onClearReferenceRequest?: () => void;
  referenceRequest?: {
    pages: Record<number, number[]>;
    color?: string;
    mode?: "highlight" | "underline";
  } | null;
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

const PDF_STATE_KEY = "askpdf.pdfState.v1";

type PdfPersistState = {
  zoom?: number;
  scrollTop?: number;
  page?: number;
  updatedAt?: number;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function PdfViewer({
  url,
  documentId,
  accessToken,
  onAddToChat,
  onClearReferenceRequest,
  referenceRequest,
}: PdfViewerProps) {
  const t = useTranslations("app.pdf");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const viewerActiveRef = useRef(false);
  const lastViewerActiveAtRef = useRef(0);
  const [state, setState] = useState<RenderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageInput, setPageInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [searchActiveIndex, setSearchActiveIndex] = useState(0);
  const [searchActiveTotal, setSearchActiveTotal] = useState(0);
  const lastSearchQueryRef = useRef("");
  const [annotationsLoading, setAnnotationsLoading] = useState(false);
  const [annotationsHydrated, setAnnotationsHydrated] = useState(false);
  const annotationsAbortRef = useRef<AbortController | null>(null);
  const resultAbortRef = useRef<AbortController | null>(null);
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
  const referenceRequestRef = useRef<PdfViewerProps["referenceRequest"]>(null);
  const selectionStateRef = useRef<{
    pageNumber: number;
    startX: number;
    startY: number;
    startWordIndex: number | null;
  } | null>(null);
  const searchResultsRef = useRef<
    { pageNumber: number; wordIndexes: number[] }[]
  >([]);
  const searchMatchesRef = useRef<
    { pageNumber: number; wordIndexes: number[] }[]
  >([]);
  const pendingRestoreRef = useRef<PdfPersistState | null>(null);
  const canPersistRef = useRef(false);
  const isRestoringRef = useRef(false);
  const scrollTopRef = useRef(0);
  const saveRafRef = useRef<number | null>(null);
  const currentPageRef = useRef(1);
  const zoomRef = useRef(1);

  const minZoom = 0.6;
  const maxZoom = 2.4;
  const zoomStep = 0.15;

  const readPdfState = () => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(PDF_STATE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed as Record<string, PdfPersistState>;
    } catch {
      return {};
    }
  };

  const writePdfState = (next: Partial<PdfPersistState>) => {
    if (!documentId) return;
    if (typeof window === "undefined") return;
    const store = readPdfState();
    const current = store[documentId] ?? {};
    store[documentId] = {
      ...current,
      ...next,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(PDF_STATE_KEY, JSON.stringify(store));
  };

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
        setTotalPages(pdf.numPages);
        const containerWidth = container.clientWidth || 720;

        const nextMeta: Record<number, PageMeta> = {};
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const viewport = page.getViewport({ scale: 1 });
          const baseWidth = Math.min(containerWidth, 900);
          const pageWidth = Math.max(240, Math.floor(baseWidth * zoom));
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
            if (referenceRequestRef.current) {
              referenceRequestRef.current = null;
              onClearReferenceRequest?.();
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
          viewerActiveRef.current = true;
          lastViewerActiveAtRef.current = Date.now();
          containerRef.current?.focus();
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
  }, [url, zoom]);

  useEffect(() => {
    pageMetaRef.current = pageMeta;
  }, [pageMeta]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const loadAnnotations = async () => {
      if (!documentId || !accessToken) {
        setAnnotations({});
        annotationsHydratedRef.current = false;
        setAnnotationsLoading(false);
        setAnnotationsHydrated(false);
        return;
      }
      annotationsHydratedRef.current = false;
      setAnnotationsLoading(true);
      setAnnotationsHydrated(false);
      try {
        annotationsAbortRef.current?.abort();
        const controller = new AbortController();
        annotationsAbortRef.current = controller;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/documents/${documentId}/annotations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
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
        setAnnotationsHydrated(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setAnnotations({});
        annotationsHydratedRef.current = true;
        setAnnotationsHydrated(true);
      } finally {
        if (annotationsAbortRef.current) {
          annotationsAbortRef.current = null;
        }
        setAnnotationsLoading(false);
      }
    };
    void loadAnnotations();
  }, [documentId, accessToken]);

  useEffect(() => {
    canPersistRef.current = false;
    pendingRestoreRef.current = null;
    setSearchQuery("");
    setSearchCount(0);
    setPageInput("");
    if (!documentId) {
      setZoom(1);
      return;
    }
    const store = readPdfState();
    const saved = store[documentId];
    if (saved && Number.isFinite(saved.zoom)) {
      pendingRestoreRef.current = saved;
      setZoom(clamp(saved.zoom as number, minZoom, maxZoom));
    } else {
      setZoom(1);
      canPersistRef.current = true;
    }
  }, [documentId, url]);

  useEffect(() => {
    if (totalPages > 0 && pageInput === "") {
      setPageInput("1");
    }
  }, [totalPages, pageInput]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pages = Array.from(
      container.querySelectorAll<HTMLElement>(".pdf-embed__page")
    );
    if (pages.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length === 0) return;
        const pageNumber = Number(
          (visible[0].target as HTMLElement).dataset.pageNumber
        );
        if (!Number.isFinite(pageNumber)) return;
        setCurrentPage(pageNumber);
        setPageInput(String(pageNumber));
      },
      {
        root: (container.closest(".pdf-embed") as HTMLElement | null) ?? container,
        threshold: [0.55, 0.7, 0.85],
      }
    );
    pages.forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  }, [pageMeta, totalPages]);

  useEffect(() => {
    if (!documentId) return;
    if (state !== "idle") return;
    const saved = pendingRestoreRef.current;
    if (!saved) {
      canPersistRef.current = true;
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const scrollRoot =
      (container.closest(".pdf-embed") as HTMLElement | null) ?? container;
    if (!scrollRoot) return;
    pendingRestoreRef.current = null;
    isRestoringRef.current = true;
    requestAnimationFrame(() => {
      if (saved.scrollTop !== undefined && saved.scrollTop !== null) {
        scrollRoot.scrollTop = saved.scrollTop;
      } else if (saved.page) {
        const pageNode = container.querySelector(
          `.pdf-embed__page[data-page-number="${saved.page}"]`
        ) as HTMLElement | null;
        pageNode?.scrollIntoView({ behavior: "auto", block: "start" });
      }
      if (saved.page) {
        setPageInput(String(saved.page));
        setCurrentPage(saved.page);
      }
      scrollTopRef.current = scrollRoot.scrollTop;
      isRestoringRef.current = false;
      canPersistRef.current = true;
    });
  }, [documentId, pageMeta, state]);

  useEffect(() => {
    if (!documentId) return;
    const container = containerRef.current;
    if (!container) return;
    const scrollRoot =
      (container.closest(".pdf-embed") as HTMLElement | null) ?? container;
    if (!scrollRoot) return;
    const handleScroll = () => {
      scrollTopRef.current = scrollRoot.scrollTop;
      if (!canPersistRef.current || isRestoringRef.current) return;
      if (saveRafRef.current !== null) {
        cancelAnimationFrame(saveRafRef.current);
      }
      saveRafRef.current = requestAnimationFrame(() => {
        writePdfState({
          scrollTop: scrollTopRef.current,
          page: currentPageRef.current,
          zoom: zoomRef.current,
        });
        saveRafRef.current = null;
      });
    };
    scrollRoot.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", handleScroll);
      if (saveRafRef.current !== null) {
        cancelAnimationFrame(saveRafRef.current);
        saveRafRef.current = null;
      }
    };
  }, [documentId, state]);

  useEffect(() => {
    if (!documentId) return;
    if (!canPersistRef.current || isRestoringRef.current) return;
    writePdfState({
      scrollTop: scrollTopRef.current,
      page: currentPage,
      zoom,
    });
  }, [currentPage, documentId, zoom]);

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

  const clearSearchHighlights = () => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll(".pdf-embed__search")
      .forEach((node) => node.remove());
  };

  useEffect(() => {
    renderAllAnnotations();
  }, [annotations, pageMeta, documentId]);

  const clearReferenceHighlights = () => {
    if (!containerRef.current) return;
    containerRef.current
      .querySelectorAll(".pdf-embed__reference")
      .forEach((node) => node.remove());
  };

  const renderReferenceHighlights = () => {
    if (!containerRef.current) return;
    const request = referenceRequestRef.current;
    clearReferenceHighlights();
    if (!request) return;
    const color = request.color ?? "#6aa9ff";
    const mode = request.mode ?? "highlight";
    for (const [pageKey, wordIndexes] of Object.entries(request.pages)) {
      const pageNumber = Number(pageKey);
      if (!Number.isFinite(pageNumber)) continue;
      const rects = wordRectsRef.current[pageNumber] || [];
      const meta = pageMetaRef.current[pageNumber];
      const overlay = getOverlayForPage(pageNumber);
      if (!meta || !overlay) continue;
      const indexSet = new Set(
        wordIndexes
          .filter((value) => Number.isFinite(Number(value)))
          .map((value) => Number(value))
      );
      const filtered = rects.filter((rect) => indexSet.has(rect.wordIndex));
      if (filtered.length === 0) continue;
      const sorted = filtered.sort((a, b) => {
        const lineA = a.lineId ?? a.top;
        const lineB = b.lineId ?? b.top;
        if (lineA !== lineB) return lineA - lineB;
        return a.left - b.left;
      });
      let group = {
        left: sorted[0].left,
        top: sorted[0].top,
        width: sorted[0].width,
        height: sorted[0].height,
        lineId: sorted[0].lineId ?? sorted[0].top,
        lastWordIndex: sorted[0].wordIndex,
      };
      const flush = () => {
        const left = group.left * meta.width;
        const top = group.top * meta.height;
        const right = (group.left + group.width) * meta.width;
        const bottom = (group.top + group.height) * meta.height;
        const highlight = document.createElement("div");
        highlight.className = "pdf-embed__reference";
        highlight.style.left = `${left}px`;
        highlight.style.top = `${top}px`;
        highlight.style.width = `${right - left}px`;
        highlight.style.height = `${bottom - top}px`;
        applyHighlightStyle(highlight, color, mode);
        overlay.appendChild(highlight);
      };
      for (let i = 1; i < sorted.length; i += 1) {
        const next = sorted[i];
        const nextLine = next.lineId ?? next.top;
        const sameLine = nextLine === group.lineId;
        const isAdjacent = next.wordIndex === group.lastWordIndex + 1;
        if (sameLine && isAdjacent) {
          const newLeft = Math.min(group.left, next.left);
          const newRight = Math.max(group.left + group.width, next.left + next.width);
          group.left = newLeft;
          group.width = newRight - newLeft;
          group.height = Math.max(group.height, next.height);
          group.lastWordIndex = next.wordIndex;
        } else {
          flush();
          group = {
            left: next.left,
            top: next.top,
            width: next.width,
            height: next.height,
            lineId: nextLine,
            lastWordIndex: next.wordIndex,
          };
        }
      }
      flush();
    }
  };

  useEffect(() => {
    referenceRequestRef.current = referenceRequest ?? null;
    renderReferenceHighlights();
    if (!referenceRequest) return;
    const pages = Object.keys(referenceRequest.pages)
      .map((key) => Number(key))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (pages.length === 0 || !containerRef.current) return;
    const pageNode = containerRef.current.querySelector(
      `.pdf-embed__page[data-page-number="${pages[0]}"]`
    ) as HTMLElement | null;
    if (pageNode) {
      pageNode.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [referenceRequest, pageMeta, documentId]);

  useEffect(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const shouldScroll = normalized !== lastSearchQueryRef.current;
    lastSearchQueryRef.current = normalized;
    runSearch(normalized, shouldScroll);
  }, [searchQuery, pageMeta]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node | null;
      const isActive = !!(target && containerRef.current.contains(target));
      viewerActiveRef.current = isActive;
      if (isActive) {
        lastViewerActiveAtRef.current = Date.now();
      }
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!containerRef.current) return;
      const target = event.target as Node | null;
      const isActive = !!(target && containerRef.current.contains(target));
      viewerActiveRef.current = isActive;
      if (isActive) {
        lastViewerActiveAtRef.current = Date.now();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      const activeElement = document.activeElement as HTMLElement | null;
      const hasFocus =
        !!(activeElement && containerRef.current?.contains(activeElement)) ||
        viewerActiveRef.current;
      const recentlyActive = Date.now() - lastViewerActiveAtRef.current < 2000;
      if (!hasFocus && !recentlyActive) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        handlePageStep("next");
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        handlePageStep("prev");
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        event.stopPropagation();
        void handleDownload();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        handleZoomChange(zoomStep);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        handleZoomChange(-zoomStep);
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        let selected = selectionDataRef.current?.text?.trim() ?? "";
        if (typeof window !== "undefined") {
          const windowSelected = window.getSelection()?.toString().trim() ?? "";
          if (windowSelected) {
            selected = windowSelected;
          }
        }
        if (selected) {
          setSearchQuery(selected);
        }
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }
      if (!selectionDataRef.current) return;
      if (!popupRef.current) return;
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
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  useEffect(() => {
    const loadResult = async () => {
      if (!documentId || !accessToken) {
        setDocumentResult(null);
        return;
      }
      try {
        resultAbortRef.current?.abort();
        const controller = new AbortController();
        resultAbortRef.current = controller;
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/documents/${documentId}/result`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
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
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setDocumentResult(null);
      } finally {
        if (resultAbortRef.current) {
          resultAbortRef.current = null;
        }
      }
    };
    void loadResult();
  }, [documentId, accessToken]);

  const runSearch = (normalizedQuery: string, shouldScroll: boolean) => {
    clearSearchHighlights();
    if (!normalizedQuery) {
      searchResultsRef.current = [];
      searchMatchesRef.current = [];
      setSearchCount(0);
      setSearchActiveIndex(0);
      setSearchActiveTotal(0);
      return;
    }
    const results: { pageNumber: number; wordIndexes: number[] }[] = [];
    const matches: { pageNumber: number; wordIndexes: number[] }[] = [];
    let totalHits = 0;
    for (const [pageKey, words] of Object.entries(wordTextRef.current)) {
      const pageNumber = Number(pageKey);
      if (!Number.isFinite(pageNumber)) continue;
      if (!words.length) continue;
      const spans: { wordIndex: number; start: number; end: number }[] = [];
      let pageText = "";
      for (const word of words) {
        const text = String(word.text ?? "");
        const start = pageText.length;
        pageText += text;
        const end = pageText.length;
        spans.push({ wordIndex: word.wordIndex, start, end });
      }
      const normalizedText = pageText.toLowerCase();
      const pageWordIndexes = new Set<number>();
      let fromIndex = 0;
      while (fromIndex <= normalizedText.length) {
        const index = normalizedText.indexOf(normalizedQuery, fromIndex);
        if (index === -1) break;
        const matchEnd = index + normalizedQuery.length;
        const matchedWords: number[] = [];
        for (const span of spans) {
          if (span.end > index && span.start < matchEnd) {
            matchedWords.push(span.wordIndex);
            pageWordIndexes.add(span.wordIndex);
          }
        }
        if (matchedWords.length > 0) {
          matches.push({
            pageNumber,
            wordIndexes: Array.from(new Set(matchedWords)).sort((a, b) => a - b),
          });
          totalHits += 1;
        }
        fromIndex = index + 1;
      }
      if (pageWordIndexes.size > 0) {
        results.push({
          pageNumber,
          wordIndexes: Array.from(pageWordIndexes).sort((a, b) => a - b),
        });
      }
    }
    searchResultsRef.current = results;
    searchMatchesRef.current = matches;
    setSearchCount(totalHits);
    setSearchActiveTotal(matches.length);
    if (matches.length === 0) {
      setSearchActiveIndex(0);
      renderSearchHighlights(matches, null);
      return;
    }
    if (shouldScroll) {
      setSearchActiveIndex(1);
      focusSearchMatch(0, true);
    } else {
      renderSearchHighlights(
        matches,
        searchActiveIndex > 0 ? searchActiveIndex - 1 : null
      );
    }
  };

  const renderSearchHighlights = (
    matches: { pageNumber: number; wordIndexes: number[] }[],
    activeMatchIndex: number | null
  ) => {
    if (!containerRef.current) return;
    clearSearchHighlights();
    const activeIndex =
      Number.isFinite(activeMatchIndex as number) && activeMatchIndex !== null
        ? activeMatchIndex
        : null;
    matches.forEach((match, index) => {
      const rects = wordRectsRef.current[match.pageNumber] || [];
      const meta = pageMetaRef.current[match.pageNumber];
      const overlay = getOverlayForPage(match.pageNumber);
      if (!rects.length || !meta || !overlay) return;
      const indexSet = new Set(match.wordIndexes);
      const filtered = rects.filter((rect) => indexSet.has(rect.wordIndex));
      if (filtered.length === 0) return;
      const sorted = filtered.sort((a, b) => {
        const lineA = a.lineId ?? a.top;
        const lineB = b.lineId ?? b.top;
        if (lineA !== lineB) return lineA - lineB;
        return a.left - b.left;
      });
      let group = {
        left: sorted[0].left,
        top: sorted[0].top,
        width: sorted[0].width,
        height: sorted[0].height,
        lineId: sorted[0].lineId ?? sorted[0].top,
        lastWordIndex: sorted[0].wordIndex,
      };
      const isActiveMatch = activeIndex === index;
      const flush = () => {
        const left = group.left * meta.width;
        const top = group.top * meta.height;
        const right = (group.left + group.width) * meta.width;
        const bottom = (group.top + group.height) * meta.height;
        const highlight = document.createElement("div");
        highlight.className = isActiveMatch
          ? "pdf-embed__search is-active"
          : "pdf-embed__search";
        highlight.style.left = `${left}px`;
        highlight.style.top = `${top}px`;
        highlight.style.width = `${right - left}px`;
        highlight.style.height = `${bottom - top}px`;
        applyHighlightStyle(highlight, "#ffe29b", "highlight");
        overlay.appendChild(highlight);
      };
      for (let i = 1; i < sorted.length; i += 1) {
        const next = sorted[i];
        const nextLine = next.lineId ?? next.top;
        const sameLine = nextLine === group.lineId;
        const isAdjacent = next.wordIndex === group.lastWordIndex + 1;
        if (sameLine && isAdjacent) {
          const newLeft = Math.min(group.left, next.left);
          const newRight = Math.max(group.left + group.width, next.left + next.width);
          group.left = newLeft;
          group.width = newRight - newLeft;
          group.height = Math.max(group.height, next.height);
          group.lastWordIndex = next.wordIndex;
        } else {
          flush();
          group = {
            left: next.left,
            top: next.top,
            width: next.width,
            height: next.height,
            lineId: nextLine,
            lastWordIndex: next.wordIndex,
          };
        }
      }
      flush();
    });
  };

  const focusSearchMatch = (index: number, shouldScroll: boolean) => {
    const matches = searchMatchesRef.current;
    if (matches.length === 0) return;
    const clamped = Math.min(Math.max(index, 0), matches.length - 1);
    const target = matches[clamped];
    setSearchActiveIndex(clamped + 1);
    renderSearchHighlights(searchMatchesRef.current, clamped);
    if (!shouldScroll || !containerRef.current) return;
    const scrollRoot =
      (containerRef.current.closest(".pdf-embed") as HTMLElement | null) ??
      containerRef.current;
    const pageNode = containerRef.current.querySelector(
      `.pdf-embed__page[data-page-number="${target.pageNumber}"]`
    ) as HTMLElement | null;
    if (!pageNode) return;
    const wordIndex = target.wordIndexes[0];
    const rects = wordRectsRef.current[target.pageNumber] || [];
    const meta = pageMetaRef.current[target.pageNumber];
    const word = rects.find((item) => item.wordIndex === wordIndex) ?? null;
    if (!word || !meta) {
      pageNode.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const rootRect = scrollRoot.getBoundingClientRect();
    const pageRect = pageNode.getBoundingClientRect();
    const wordTop = pageRect.top - rootRect.top + scrollRoot.scrollTop + word.top * meta.height;
    const wordBottom = pageRect.top - rootRect.top + scrollRoot.scrollTop +
      (word.top + word.height) * meta.height;
    const viewTop = scrollRoot.scrollTop;
    const viewBottom = viewTop + scrollRoot.clientHeight;
    const padding = 80;
    if (wordTop < viewTop + padding || wordBottom > viewBottom - padding) {
      const targetTop = Math.max(wordTop - padding, 0);
      scrollRoot.scrollTo({ top: targetTop, behavior: "smooth" });
    }
  };

  const handleSearchNav = (direction: "prev" | "next") => {
    const matches = searchMatchesRef.current;
    if (matches.length === 0) return;
    const current = searchActiveIndex > 0 ? searchActiveIndex - 1 : 0;
    const next =
      direction === "next"
        ? (current + 1) % matches.length
        : (current - 1 + matches.length) % matches.length;
    focusSearchMatch(next, true);
  };

  const handleZoomChange = (delta: number) => {
    setZoom((prev) => {
      const next = Math.min(maxZoom, Math.max(minZoom, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "document.pdf";
      link.rel = "noopener";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = url;
      link.download = "document.pdf";
      link.rel = "noopener";
      link.click();
    }
  };

  const jumpToPage = (value?: number) => {
    if (!containerRef.current) return;
    const pageNodes = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(".pdf-embed__page")
    );
    const domTotal =
      pageNodes.length > 0
        ? Math.max(
            ...pageNodes
              .map((node) => Number(node.dataset.pageNumber))
              .filter((value) => Number.isFinite(value))
          )
        : 0;
    const pageTotal = totalPages > 0 ? totalPages : domTotal;
    if (pageTotal === 0) return;
    const numeric =
      typeof value === "number" ? value : Number.parseInt(pageInput, 10);
    if (!Number.isFinite(numeric)) return;
    const clamped = Math.min(Math.max(1, Math.floor(numeric)), pageTotal);
    setPageInput(String(clamped));
    const pageNode = containerRef.current.querySelector(
      `.pdf-embed__page[data-page-number="${clamped}"]`
    ) as HTMLElement | null;
    if (pageNode) {
      pageNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageStep = (direction: "prev" | "next") => {
    const getVisiblePageNumber = () => {
      if (!containerRef.current) return null;
      const scrollRoot =
        (containerRef.current.closest(".pdf-embed") as HTMLElement | null) ??
        containerRef.current;
      const rootRect = scrollRoot.getBoundingClientRect();
      const pages = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(".pdf-embed__page")
      );
      if (pages.length === 0) return null;
      let bestPage: number | null = null;
      let bestDelta = Infinity;
      for (const page of pages) {
        const pageNumber = Number(page.dataset.pageNumber);
        if (!Number.isFinite(pageNumber)) continue;
        const rect = page.getBoundingClientRect();
        const delta = Math.abs(rect.top - rootRect.top);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestPage = pageNumber;
        }
      }
      return bestPage;
    };
    const visiblePage = getVisiblePageNumber();
    const parsedInput = Number.parseInt(pageInput, 10);
    const base =
      visiblePage ??
      (Number.isFinite(currentPage) ? currentPage : null) ??
      (Number.isFinite(parsedInput) ? parsedInput : 1);
    const next = direction === "next" ? base + 1 : base - 1;
    jumpToPage(next);
  };

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
    viewerActiveRef.current = true;
    lastViewerActiveAtRef.current = Date.now();
    containerRef.current?.focus();
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
    const rectByWord = new Map<number, WordRect>();
    for (const rect of rects) {
      rectByWord.set(rect.wordIndex, rect);
    }

    const lineMap = new Map<
      string,
      { wordIndexes: number[]; top: number; bottom: number }
    >();
    for (const wordKey of Object.keys(entries)) {
      const wordIndex = Number(wordKey);
      if (!Number.isFinite(wordIndex)) continue;
      const rect = rectByWord.get(wordIndex);
      if (!rect) continue;
      const lineKey = String(rect.lineId ?? rect.top);
      const existing = lineMap.get(lineKey);
      const rectTop = rect.top;
      const rectBottom = rect.top + rect.height;
      if (existing) {
        existing.wordIndexes.push(wordIndex);
        existing.top = Math.min(existing.top, rectTop);
        existing.bottom = Math.max(existing.bottom, rectBottom);
      } else {
        lineMap.set(lineKey, {
          wordIndexes: [wordIndex],
          top: rectTop,
          bottom: rectBottom,
        });
      }
    }

    if (lineMap.size === 0) return;

    for (const lineData of lineMap.values()) {
      lineData.wordIndexes.sort((a, b) => a - b);
    }

    type Segment = {
      mode: "highlight" | "underline";
      color: string;
      wordIndex: number;
      left: number;
      right: number;
      top: number;
      height: number;
      lineKey: string;
    };

    const segments: Segment[] = [];

    for (const [lineKey, lineData] of lineMap.entries()) {
      const { wordIndexes, top, bottom } = lineData;
      for (let i = 0; i < wordIndexes.length; i += 1) {
        const wordIndex = wordIndexes[i];
        const rect = rectByWord.get(wordIndex);
        if (!rect) continue;
        const left = rect.left;
        const right = rect.left + rect.width;
        let leftBound = left;
        let rightBound = right;
        const prevIndex = wordIndexes[i - 1];
        if (prevIndex === wordIndex - 1) {
          const prevRect = rectByWord.get(prevIndex);
          if (prevRect) {
            const prevRight = prevRect.left + prevRect.width;
            leftBound = (prevRight + left) / 2;
          }
        }
        const nextIndex = wordIndexes[i + 1];
        if (nextIndex === wordIndex + 1) {
          const nextRect = rectByWord.get(nextIndex);
          if (nextRect) {
            const nextLeft = nextRect.left;
            rightBound = (right + nextLeft) / 2;
          }
        }
        const list = entries[wordIndex] ?? [];
        for (const entry of list) {
          segments.push({
            mode: entry.mode,
            color: entry.color,
            wordIndex,
            left: leftBound,
            right: rightBound,
            top,
            height: bottom - top,
            lineKey,
          });
        }
      }
    }

    const segmentsByKey = new Map<string, Segment[]>();
    for (const segment of segments) {
      const key = `${segment.lineKey}|${segment.mode}|${segment.color}`;
      const list = segmentsByKey.get(key);
      if (list) {
        list.push(segment);
      } else {
        segmentsByKey.set(key, [segment]);
      }
    }

    for (const list of segmentsByKey.values()) {
      list.sort((a, b) => a.wordIndex - b.wordIndex);
      let current = list[0];
      let group = { ...current };
      const flush = () => {
        const left = group.left * meta.width;
        const top = group.top * meta.height;
        const right = group.right * meta.width;
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
      for (let i = 1; i < list.length; i += 1) {
        const next = list[i];
        const isAdjacent = next.wordIndex === group.wordIndex + 1;
        if (isAdjacent) {
          group.right = next.right;
          group.wordIndex = next.wordIndex;
        } else {
          flush();
          group = { ...next };
        }
      }
      flush();
    }
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
      {state !== "error" && (annotationsLoading || (!annotationsHydrated && documentId && accessToken)) ? (
        <div className="pdf-embed__hint">Annotation loading...</div>
      ) : null}
      <div
        ref={containerRef}
        className="pdf-embed__pages"
        tabIndex={0}
        onPointerDown={() => {
          viewerActiveRef.current = true;
          containerRef.current?.focus();
        }}
        onFocus={() => {
          viewerActiveRef.current = true;
        }}
        onBlur={() => {
          viewerActiveRef.current = false;
        }}
      />
      <div className="pdf-embed__toolbar" role="toolbar" aria-label="PDF controls">
        <div className="pdf-embed__toolbar-group">
          <svg
            className="pdf-embed__toolbar-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="pdf-embed__toolbar-input"
            type="search"
            placeholder="検索 ⌘ F"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSearchNav(event.shiftKey ? "prev" : "next");
              }
            }}
            aria-label="search in pdf"
            ref={searchInputRef}
          />
          {searchActiveTotal > 0 ? (
            <div className="pdf-embed__toolbar-search-nav" aria-label="search navigation">
              <button
                type="button"
                className="pdf-embed__toolbar-btn"
                onClick={() => handleSearchNav("prev")}
                aria-label="previous match"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="8 14 12 10 16 14" />
                </svg>
              </button>
              <span className="pdf-embed__toolbar-search-count">
                {searchActiveIndex}/{searchActiveTotal}
              </span>
              <button
                type="button"
                className="pdf-embed__toolbar-btn"
                onClick={() => handleSearchNav("next")}
                aria-label="next match"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="8 10 12 14 16 10" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
        <span className="pdf-embed__toolbar-divider" />
        <div className="pdf-embed__toolbar-group">
          <button
            type="button"
            className="pdf-embed__toolbar-btn"
            onClick={() => handleZoomChange(-zoomStep)}
            aria-label={t("zoomOut")}
            data-tooltip={t("zoomOutTooltip")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span className="pdf-embed__toolbar-zoom">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="pdf-embed__toolbar-btn"
            onClick={() => handleZoomChange(zoomStep)}
            aria-label={t("zoomIn")}
            data-tooltip={t("zoomInTooltip")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
        <span className="pdf-embed__toolbar-divider" />
        <div className="pdf-embed__toolbar-group">
          <button
            type="button"
            className="pdf-embed__toolbar-btn"
            onClick={() => handlePageStep("prev")}
            aria-label={t("prevPage")}
            data-tooltip={t("prevPageTooltip")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>
          <input
            className="pdf-embed__toolbar-page"
            type="number"
            min={1}
            max={totalPages || 1}
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                jumpToPage();
              }
            }}
            onBlur={() => jumpToPage()}
            aria-label="page number"
          />
          <span className="pdf-embed__toolbar-total">
            / {totalPages > 0 ? totalPages : "--"}
          </span>
          <button
            type="button"
            className="pdf-embed__toolbar-btn"
            onClick={() => handlePageStep("next")}
            aria-label={t("nextPage")}
            data-tooltip={t("nextPageTooltip")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </div>
        <span className="pdf-embed__toolbar-divider" />
        <button
          type="button"
          className="pdf-embed__toolbar-btn"
          onClick={handleDownload}
          aria-label={t("download")}
          data-tooltip={t("downloadTooltip")}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
