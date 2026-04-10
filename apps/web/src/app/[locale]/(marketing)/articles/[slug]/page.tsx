import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  getAllArticleParams,
  getArticleContent,
  getArticleLocales,
  isArticleSlug,
  type ArticleHeading,
} from "@/content/articles";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

import { ArticleAppPromo } from "../article-app-promo";
import { ArticleImageLightbox } from "../article-image-lightbox";
import { ArticleLocaleSelect } from "../article-locale-select";
import { ArticleMobileToc } from "../article-mobile-toc";
import styles from "../article-page.module.css";

type ArticlePageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

const chromeCopy = {
  ja: {
    home: "ホーム",
    articles: "記事",
    openApp: "アプリを開く",
    footer: "AskPDF",
    promoTitle: "PDFを読むなら、記事だけで終わらせずにそのまま試せます。",
    promoBody: "AskPDF なら PDF をアップロードして、根拠付きで質問しながら読むところまで一画面で進められます。",
    dismissPromo: "アプリ紹介を閉じる",
  },
  en: {
    home: "Home",
    articles: "Articles",
    openApp: "Open App",
    footer: "AskPDF",
    promoTitle: "If you want to read PDFs, you can try the workflow directly instead of stopping at the article.",
    promoBody: "AskPDF lets you upload a PDF, ask questions with evidence, and continue reading in one screen.",
    dismissPromo: "Dismiss app promo",
  },
  es: {
    home: "Inicio",
    articles: "Artículos",
    openApp: "Abrir app",
    footer: "AskPDF",
    promoTitle: "Si quieres leer PDFs con IA, puedes probar el flujo directamente.",
    promoBody: "Con AskPDF puedes subir un PDF, hacer preguntas con evidencia y seguir leyendo en una sola pantalla.",
    dismissPromo: "Cerrar promoción de la app",
  },
  fr: {
    home: "Accueil",
    articles: "Articles",
    openApp: "Ouvrir l'app",
    footer: "AskPDF",
    promoTitle: "Si vous voulez lire des PDF avec l'IA, vous pouvez tester le flux directement.",
    promoBody: "AskPDF permet d'importer un PDF, de poser des questions avec preuves et de poursuivre la lecture sur un seul écran.",
    dismissPromo: "Fermer la promo de l'app",
  },
  de: {
    home: "Home",
    articles: "Artikel",
    openApp: "App öffnen",
    footer: "AskPDF",
    promoTitle: "Wenn Sie PDFs mit KI lesen möchten, können Sie den Ablauf direkt ausprobieren.",
    promoBody: "Mit AskPDF laden Sie ein PDF hoch, stellen Fragen mit Belegen und lesen alles in einer Oberfläche weiter.",
    dismissPromo: "App-Hinweis schließen",
  },
  ko: {
    home: "홈",
    articles: "아티클",
    openApp: "앱 열기",
    footer: "AskPDF",
    promoTitle: "PDF를 AI로 읽고 싶다면 글만 보지 말고 바로 워크플로를 써볼 수 있습니다.",
    promoBody: "AskPDF에서는 PDF 업로드, 근거가 있는 질문, 원문 확인까지 한 화면에서 이어집니다.",
    dismissPromo: "앱 안내 닫기",
  },
  zh: {
    home: "首页",
    articles: "文章",
    openApp: "打开应用",
    footer: "AskPDF",
    promoTitle: "如果你想用 AI 阅读 PDF，可以直接试用完整流程，而不只是停留在文章里。",
    promoBody: "AskPDF 支持上传 PDF、基于依据提问，并在同一界面继续阅读和核对。",
    dismissPromo: "关闭应用推广卡片",
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

function createMarkdownComponents(headings: ArticleHeading[]): Components {
  let cursor = 0;

  const takeHeading = () => {
    const heading = headings[cursor] ?? null;
    cursor += 1;
    return heading;
  };

  return {
    h2: ({ children }) => {
      const heading = takeHeading();
      return (
        <h2 id={heading?.id} className={styles.articleH2}>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => {
      const heading = takeHeading();
      return (
        <h3 id={heading?.id} className={styles.articleH3}>
          {children}
        </h3>
      );
    },
    a: ({ href, children }) => {
      const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          className={styles.bodyLink}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    img: ({ src, alt }) => <ArticleImageLightbox src={src} alt={alt} />,
  };
}

export function generateStaticParams() {
  return getAllArticleParams();
}

export function generateMetadata({
  params: { locale, slug },
}: ArticlePageProps): Metadata {
  const content = getArticleContent(slug, locale);
  const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;

  if (!content || !isArticleSlug(slug)) {
    return {};
  }

  const canonical = `${siteUrl}/${resolvedLocale}/articles/${slug}`;
  const languages = Object.fromEntries(
    getArticleLocales(slug).map((item) => [item, `${siteUrl}/${item}/articles/${slug}`])
  );

  return {
    metadataBase: new URL(siteUrl),
    title: `${content.meta.title} | AskPDF`,
    description: content.meta.description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: canonical,
      siteName: "AskPDF",
      type: "article",
    },
  };
}

export default function ArticlePage({
  params: { locale, slug },
}: ArticlePageProps) {
  const content = getArticleContent(slug, locale);
  const resolvedLocale = routing.locales.includes(locale as (typeof routing.locales)[number])
    ? locale
    : routing.defaultLocale;
  const chromeText = chromeCopy[resolvedLocale as keyof typeof chromeCopy];

  if (!content || !isArticleSlug(slug)) {
    notFound();
  }

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
            <ArticleLocaleSelect
              className={styles.headerLocale}
              currentLocale={resolvedLocale}
              currentPath={`/articles/${slug}`}
            />
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
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.sidePanel}>
              <Link href="/articles" locale={resolvedLocale} className={styles.backLink}>
                ← Articles
              </Link>
            </section>

            {content.headings.length ? (
              <section className={`${styles.sidePanel} ${styles.desktopTocPanel}`}>
                <h2 className={styles.tocTitle}>{content.meta.tocTitle}</h2>
                <nav className={styles.tocList} aria-label={content.meta.tocTitle}>
                  {content.headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={styles.tocLink}
                      data-depth={heading.depth}
                    >
                      {heading.title}
                    </a>
                  ))}
                </nav>
              </section>
            ) : null}

            <ArticleMobileToc
              className={styles.tabletToc}
              title={content.meta.tocTitle}
              headings={content.headings}
            />
          </aside>

          <div className={styles.mainColumn}>
            <div className={styles.mobileOnlyStack}>
              <div className={styles.mobileTopRow}>
                <Link href="/articles" locale={resolvedLocale} className={styles.mobileArticlesLink}>
                  ← Articles
                </Link>
                <ArticleLocaleSelect
                  className={styles.mobileLocale}
                  currentLocale={resolvedLocale}
                  currentPath={`/articles/${slug}`}
                />
              </div>
              <ArticleMobileToc
                title={content.meta.tocTitle}
                headings={content.headings}
              />
            </div>

            <ArticleAppPromo
              locale={resolvedLocale}
              title={chromeText.promoTitle}
              body={chromeText.promoBody}
              cta={chromeText.openApp}
              dismiss={chromeText.dismissPromo}
            />

            <article className={styles.articleCard}>
              <header className={styles.articleLead}>
                <h1 className={styles.articleTitle}>{content.meta.title}</h1>
                <p className={styles.articleDescription}>{content.meta.description}</p>
                <div className={styles.metaRow}>
                  {formatDate(content.meta.publishedAt, resolvedLocale) ? (
                    <span>{formatDate(content.meta.publishedAt, resolvedLocale)}</span>
                  ) : null}
                  {content.meta.publishedAt && content.meta.topics.length ? (
                    <span className={styles.metaDivider} aria-hidden="true" />
                  ) : null}
                  <div className={styles.topicList}>
                    {content.meta.topics.map((topic) => (
                      <span key={topic} className={styles.topic}>
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </header>

              <div className={styles.articleBody}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={createMarkdownComponents(content.headings)}
                >
                  {content.markdown}
                </ReactMarkdown>
              </div>

              <div className={styles.footerNote}>
                <Link href="/app" locale={resolvedLocale} className={styles.inlineCta}>
                  {chromeText.openApp}
                </Link>
              </div>
            </article>
          </div>
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
