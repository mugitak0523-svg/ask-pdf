"use client";

import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";

import styles from "./article-page.module.css";

type ArticleAppPromoProps = {
  locale: string;
  title: string;
  body: string;
  cta: string;
  dismiss: string;
};

const STORAGE_KEY = "askpdf-article-promo-dismissed";

export function ArticleAppPromo({
  locale,
  title,
  body,
  cta,
  dismiss,
}: ArticleAppPromoProps) {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setReady(true);
  }, []);

  if (ready && dismissed) {
    return null;
  }

  return (
    <section className={styles.promoCard} aria-label={title}>
      <button
        type="button"
        className={styles.promoDismiss}
        aria-label={dismiss}
        onClick={() => {
          window.localStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }}
      >
        ×
      </button>

      <div className={styles.promoCopy}>
        <p className={styles.promoEyebrow}>AskPDF</p>
        <h2 className={styles.promoTitle}>{title}</h2>
        <p className={styles.promoBody}>{body}</p>
      </div>

      <div className={styles.promoActions}>
        <Link href="/app" locale={locale} className={styles.promoCta}>
          {cta}
        </Link>
      </div>
    </section>
  );
}
