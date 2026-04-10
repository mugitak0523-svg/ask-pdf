"use client";

import { useEffect, useState } from "react";

import styles from "./article-page.module.css";

type ArticleImageLightboxProps = {
  alt?: string;
  src?: string;
};

export function ArticleImageLightbox({ alt = "", src }: ArticleImageLightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!src) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={styles.zoomImageButton}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className={styles.zoomImage} />
      </button>

      {open ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Expanded image"}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            aria-label="Close image"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <div
            className={styles.lightboxImageWrap}
            onClick={(event) => event.stopPropagation()}
          >
            <img src={src} alt={alt} className={styles.lightboxImage} />
          </div>
        </div>
      ) : null}
    </>
  );
}
