import type { Metadata } from "next";

import { getArticleSummaries } from "@/content/articles";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

import { ArticleLocaleSelect } from "./article-locale-select";
import styles from "./article-page.module.css";

type ArticlesIndexPageProps = {
  params: {
    locale: string;
  };
};

const chromeCopy = {
  ja: {
    home: "ホーム",
    articles: "記事",
    openApp: "アプリを開く",
    title: "記事一覧",
    footer: "AskPDF",
  },
  en: {
    home: "Home",
    articles: "Articles",
    openApp: "Open App",
    title: "Articles",
    footer: "AskPDF",
  },
  es: {
    home: "Inicio",
    articles: "Artículos",
    openApp: "Abrir app",
    title: "Artículos",
    footer: "AskPDF",
  },
  fr: {
    home: "Accueil",
    articles: "Articles",
    openApp: "Ouvrir l'app",
    title: "Articles",
    footer: "AskPDF",
  },
  de: {
    home: "Home",
    articles: "Artikel",
    openApp: "App öffnen",
    title: "Artikel",
    footer: "AskPDF",
  },
  ko: {
    home: "홈",
    articles: "아티클",
    openApp: "앱 열기",
    title: "아티클",
    footer: "AskPDF",
  },
  zh: {
    home: "首页",
    articles: "文章",
    openApp: "打开应用",
    title: "文章",
    footer: "AskPDF",
  },
} as const;

function formatDate(dateText: string, locale: string) {
  if (!dateText) return null;
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) return dateText;
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function generateMetadata({
  params: { locale },
}: ArticlesIndexPageProps): Metadata {
  const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;
  const canonical = `${siteUrl}/${resolvedLocale}/articles`;

  return {
    metadataBase: new URL(siteUrl),
    title: "Articles | AskPDF",
    description: "Markdown-based article pages for AskPDF features, comparisons, and use cases.",
    alternates: {
      canonical,
    },
  };
}

export default function ArticlesIndexPage({
  params: { locale },
}: ArticlesIndexPageProps) {
  const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;
  const chromeText = chromeCopy[resolvedLocale as keyof typeof chromeCopy];
  const articles = getArticleSummaries(resolvedLocale);

  return (
    <main className={styles.page}>
      <header className={styles.siteHeader}>
        <div className={styles.siteHeaderInner}>
          <Link href="/" locale={resolvedLocale} className={styles.chromeBrand}>
            <span className={styles.brandIcon} aria-hidden="true">
              <img className={styles.brandIconImage} src="/icon.svg" alt="" />
            </span>
            <span className={styles.brandLabel}>AskPDF</span>
          </Link>
          <nav className={styles.chromeNav} aria-label="Articles navigation">
            <ArticleLocaleSelect currentLocale={resolvedLocale} currentPath="/articles" />
            <Link href="/" locale={resolvedLocale} className={styles.chromeLink}>
              {chromeText.home}
            </Link>
            <Link href="/articles" locale={resolvedLocale} className={styles.chromeLink}>
              {chromeText.articles}
            </Link>
            <Link href="/app" locale={resolvedLocale} className={styles.appLink}>
              {chromeText.openApp}
            </Link>
          </nav>
        </div>
      </header>

      <div className={styles.pageInner}>
        <div className={styles.indexWrap}>
          <header className={styles.indexHeading}>
            <h1 className={styles.indexTitle}>{chromeText.title}</h1>
          </header>

          <section className={styles.indexPanel}>
            {articles.map((article) => (
              <Link
                key={`${article.slug}-${article.locale}`}
                href={`/articles/${article.slug}`}
                locale={resolvedLocale}
                className={styles.articleRow}
              >
                <span className={styles.rowEmoji} aria-hidden="true">
                  {article.meta.emoji}
                </span>
                <div>
                  <h2 className={styles.rowTitle}>{article.meta.title}</h2>
                  <p className={styles.rowDescription}>{article.meta.description}</p>
                  <div className={styles.rowMeta}>
                    {formatDate(article.meta.publishedAt, resolvedLocale) ? (
                      <span>{formatDate(article.meta.publishedAt, resolvedLocale)}</span>
                    ) : null}
                    {article.meta.topics.map((topic) => (
                      <span key={topic} className={styles.topic}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>

      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <p className={styles.footerCopy}>{chromeText.footer}</p>
          <div className={styles.chromeNav}>
            <Link href="/" locale={resolvedLocale} className={styles.chromeLink}>
              {chromeText.home}
            </Link>
            <Link href="/articles" locale={resolvedLocale} className={styles.chromeLink}>
              {chromeText.articles}
            </Link>
            <Link href="/app" locale={resolvedLocale} className={styles.chromeLink}>
              {chromeText.openApp}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
