import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";

type BBox = [number, number, number, number];

type Page = {
  pageNumber: number;
  widthInch: number;
  heightInch: number;
};

export type Highlight = {
  id: string;
  pageNumber: number;
  bbox: BBox;
  label?: string;
};

type PdfViewerProps = {
  pages: Page[];
  highlights: Highlight[];
  activeHighlightId?: string | null;
};

type HighlightStyle = {
  id: string;
  pageNumber: number;
  style: CSSProperties;
};

export function PdfViewer({
  pages,
  highlights,
  activeHighlightId,
}: PdfViewerProps) {
  const highlightRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const highlightStyles = useMemo<HighlightStyle[]>(() => {
    const pageMap = new Map(pages.map((p) => [p.pageNumber, p]));
    const styles: HighlightStyle[] = [];
    for (const highlight of highlights) {
      const page = pageMap.get(highlight.pageNumber);
      if (!page) continue;
      const [x1, y1, x2, y2] = highlight.bbox;
      const left = (x1 / page.widthInch) * 100;
      const top = (y1 / page.heightInch) * 100;
      const width = ((x2 - x1) / page.widthInch) * 100;
      const height = ((y2 - y1) / page.heightInch) * 100;
      styles.push({
        id: highlight.id,
        pageNumber: highlight.pageNumber,
        style: {
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        },
      });
    }
    return styles;
  }, [highlights, pages]);

  useEffect(() => {
    if (!activeHighlightId) return;
    const node = highlightRefs.current[activeHighlightId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeHighlightId]);

  return (
    <div className="viewer__scroll">
      {pages.map((page) => (
        <div key={page.pageNumber} className="pdf-page">
          <div className="pdf-page__canvas">
            <div className="pdf-page__header">
              <span>PAGE {page.pageNumber}</span>
              <span>{page.widthInch} in × {page.heightInch} in</span>
            </div>
            <div className="pdf-page__body">
              <div className="line wide" />
              <div className="line" />
              <div className="line" />
              <div className="block" />
              <div className="line wide" />
              <div className="line" />
            </div>
          </div>

          <div className="pdf-page__overlay">
            {highlightStyles
              .filter((item) => item.pageNumber === page.pageNumber)
              .map((item) => (
                <div
                  key={item.id}
                  ref={(node) => {
                    highlightRefs.current[item.id] = node;
                  }}
                  className={
                    item.id === activeHighlightId
                      ? "highlight highlight--active"
                      : "highlight"
                  }
                  style={item.style}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
