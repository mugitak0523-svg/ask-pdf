import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

import styles from "./article-page.module.css";

type ArticleLocaleSelectProps = {
  className?: string;
  currentLocale: string;
  currentPath: string;
};

const localeLabels: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ko: "한국어",
  zh: "中文",
};

export function ArticleLocaleSelect({
  className,
  currentLocale,
  currentPath,
}: ArticleLocaleSelectProps) {
  const resolvedLocale = routing.locales.includes(currentLocale as Locale)
    ? (currentLocale as Locale)
    : routing.defaultLocale;

  return (
    <div
      className={className ? `${styles.navLocale} ${className}` : styles.navLocale}
      aria-label="Language"
    >
      <details className={styles.navLocaleDropdown}>
        <summary className={styles.navLocaleTrigger}>
          <span className={styles.navLocaleCurrent}>
            {localeLabels[resolvedLocale] ?? resolvedLocale.toUpperCase()}
          </span>
          <span className={styles.navLocaleCaret} aria-hidden="true">
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
        <div className={styles.navLocaleMenu} role="listbox" aria-label="Language">
          {routing.locales.map((locale) => (
            <Link
              key={locale}
              href={currentPath}
              locale={locale}
              className={`${styles.navLocaleMenuItem} ${
                locale === resolvedLocale ? styles.navLocaleMenuItemActive : ""
              }`}
            >
              {localeLabels[locale] ?? locale.toUpperCase()}
            </Link>
          ))}
        </div>
      </details>
    </div>
  );
}
