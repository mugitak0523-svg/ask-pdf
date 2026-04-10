"use client";

import { useRef } from "react";

import styles from "./article-page.module.css";

type MobileHeading = {
  depth: 2 | 3;
  id: string;
  title: string;
};

type ArticleMobileTocProps = {
  className?: string;
  title: string;
  headings: MobileHeading[];
};

export function ArticleMobileToc({ className, title, headings }: ArticleMobileTocProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  if (!headings.length) {
    return null;
  }

  return (
    <section className={className ? `${styles.mobileToc} ${className}` : styles.mobileToc}>
      <details ref={detailsRef} className={styles.mobileTocDetails}>
        <summary className={styles.mobileTocTrigger}>
          <span>{title}</span>
          <span className={styles.mobileTocCaret} aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path
                d="m6 8 4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <nav className={styles.mobileTocMenu} aria-label={title}>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={styles.mobileTocLink}
              data-depth={heading.depth}
              onClick={() => {
                detailsRef.current?.removeAttribute("open");
              }}
            >
              {heading.title}
            </a>
          ))}
        </nav>
      </details>
    </section>
  );
}
