"use client";

import { useEffect, useRef, useState } from "react";

type PdfEmbedProps = {
  url: string;
};

type RenderState = "idle" | "loading" | "error";

export function PdfEmbed({ url }: PdfEmbedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<RenderState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      setState("loading");
      setErrorMessage(null);
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const loadingTask = pdfjs.getDocument({ url });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        const baseWidth = container.clientWidth || 720;
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: 1 });
          const scale = baseWidth / viewport.width;
          const scaled = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.className = "pdf-embed__canvas";
          canvas.width = Math.floor(scaled.width);
          canvas.height = Math.floor(scaled.height);
          const pageWrapper = document.createElement("div");
          pageWrapper.className = "pdf-embed__page";
          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);
          const context = canvas.getContext("2d");
          if (!context) continue;
          const renderTask = page.render({ canvasContext: context, viewport: scaled });
          await renderTask.promise;
        }
        if (!cancelled) {
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
