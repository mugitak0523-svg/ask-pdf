import type { Metadata } from "next";

import { getLpGeneralContent } from "@/content/lp/general";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

import { LpSignupCta, LpViewTracker } from "./lp/general/lp-events";
import { LpHeroVideo } from "./lp/general/lp-hero-video";
import styles from "./lp/general/page.module.css";

type LpPageProps = {
  params: {
    locale: string;
  };
};

const ogImagePath = "/lp-hero-image.jpg";

const ogLocaleMap: Record<string, string> = {
  ja: "ja_JP",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ko: "ko_KR",
  zh: "zh_CN",
};

const keywordMap: Record<string, string[]> = {
  ja: [
    "PDF AI",
    "PDF チャット",
    "PDF 検索",
    "OCR",
    "手書き文書解析",
    "根拠付き回答",
    "AskPDF",
  ],
  en: [
    "PDF AI",
    "PDF chat",
    "PDF search",
    "OCR",
    "handwritten document OCR",
    "cited answers",
    "AskPDF",
  ],
  es: ["IA para PDF", "chat PDF", "búsqueda PDF", "OCR", "AskPDF"],
  fr: ["IA pour PDF", "chat PDF", "recherche PDF", "OCR", "AskPDF"],
  de: ["KI für PDF", "PDF-Chat", "PDF-Suche", "OCR", "AskPDF"],
  ko: ["PDF AI", "PDF 채팅", "PDF 검색", "OCR", "AskPDF"],
  zh: ["PDF AI", "PDF 聊天", "PDF 搜索", "OCR", "AskPDF"],
};

export async function generateMetadata({ params }: LpPageProps): Promise<Metadata> {
  const requestedLocale = params.locale || routing.defaultLocale;
  const locale = routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
    ? requestedLocale
    : routing.defaultLocale;
  const content = getLpGeneralContent(locale);
  const title = content.meta.title;
  const description = content.meta.description;
  const canonical = `${siteUrl}/${locale}`;
  const languageAlternates: Record<string, string> = Object.fromEntries(
    routing.locales.map((item) => [item, `${siteUrl}/${item}`])
  );
  languageAlternates["x-default"] = `${siteUrl}/${routing.defaultLocale}`;
  const openGraphLocale = ogLocaleMap[locale] ?? ogLocaleMap.en;
  const openGraphAlternateLocales = routing.locales
    .filter((item) => item !== locale)
    .map((item) => ogLocaleMap[item])
    .filter(Boolean);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: keywordMap[locale] ?? keywordMap.en,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale: openGraphLocale,
      alternateLocale: openGraphAlternateLocales,
      siteName: "AskPDF",
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: "AskPDF - Ask AI About PDFs With Citations",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImagePath],
    },
  };
}

const softwareApplicationLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AskPDF",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
};

const localeLabels: Record<string, string> = {
  ja: "日本語",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ko: "한국어",
  zh: "中文",
};

const painIcons = [
  (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M20.926 13.15a9 9 0 1 0 -7.835 7.784"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7v5l2 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 22l-5 -5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 22l5 -5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 9v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 16h.01" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M4 12v-6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 18h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 18h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 15l-3 3l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 15l3 3l-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
];

function renderFeatureDetailIcon(id: string) {
  switch (id) {
    case "pdf_management":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "pdf_viewing":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M14 3v4a1 1 0 0 0 1 1h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "tabs":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="20" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 8H22" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 4V8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4V8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 4V8" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="5" width="3" height="2" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "annotation_minimap":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="14" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 5H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M5 9H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M5 13H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <rect x="18" y="2" width="4" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="19" y="6" width="2" height="3" fill="currentColor" />
          <rect x="19" y="12" width="2" height="2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M8 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M8 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "pdf_search":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5 6H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M5 9H13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path d="M5 12H10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="18" cy="18" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 21L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "ocr":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="3" width="20" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 8H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 12H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 16H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M10 16H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "shortcut":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <rect x="13" y="14" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <text x="7" y="9" fontSize="4" fontWeight="bold" textAnchor="middle" fill="currentColor">⌘</text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
  }
}

export default function LpGeneralPage({ params }: LpPageProps) {
  const requestedLocale = params.locale || routing.defaultLocale;
  const locale = routing.locales.includes(requestedLocale as (typeof routing.locales)[number])
    ? requestedLocale
    : routing.defaultLocale;
  const canonicalUrl = `${siteUrl}/${locale}`;
  const content = getLpGeneralContent(locale);
  const faqPageLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AskPDF",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AskPDF",
    url: siteUrl,
    inLanguage: locale,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AskPDF",
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className={styles.mkRoot}>
      <LpViewTracker locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.nav}>
            <Link href="/" locale={locale} className={styles.brandBlock}>
              <img
                src="/icon.svg"
                alt=""
                className={styles.brandIcon}
                width={34}
                height={34}
              />
              <div className={styles.brandText}>
                <span className={styles.brand}>{content.nav.brand}</span>
              </div>
            </Link>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navLink}>
                {content.nav.links.features}
              </a>
              <a href="#compare" className={styles.navLink}>
                {content.nav.links.compare}
              </a>
              <a href="#pricing" className={styles.navLink}>
                {content.nav.links.pricing}
              </a>
              <a href="#faq" className={styles.navLink}>
                {content.nav.links.faq}
              </a>
            </div>
            <div className={styles.navRight}>
              <div className={styles.navLocale} aria-label={content.nav.langLabel}>
                <details className={styles.navLocaleDropdown}>
                  <summary className={styles.navLocaleTrigger}>
                    <span className={styles.navLocaleCurrent}>
                      {localeLabels[locale] ?? locale.toUpperCase()}
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
                  <div className={styles.navLocaleMenu} role="listbox" aria-label={content.nav.langLabel}>
                    {routing.locales.map((item) => (
                      <Link
                        key={item}
                        href="/"
                        locale={item}
                        className={`${styles.navLocaleMenuItem} ${
                          locale === item ? styles.navLocaleMenuItemActive : ""
                        }`}
                      >
                        {localeLabels[item] ?? item.toUpperCase()}
                      </Link>
                    ))}
                  </div>
                </details>
              </div>
              <div className={styles.navCta}>
                <LpSignupCta
                  label={content.nav.cta}
                  locale={locale}
                  placement="hero_secondary"
                  variant="ghost"
                />
              </div>
            </div>
          </div>

          <div className={styles.heroMain}>
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>{content.hero.title}</h1>
              <p className={styles.heroSubtitle}>{content.hero.subtitle}</p>
              <div className={styles.ctaRow}>
                <LpSignupCta
                  label={content.hero.primaryCta}
                  locale={locale}
                  placement="hero_primary"
                />
                <a
                  href="#pricing"
                  className={`${styles.ctaButton} ${styles.ctaButtonGhost} ${styles.secondaryCta}`}
                >
                  {content.hero.secondaryCta}
                </a>
              </div>
            </div>

            <aside className={styles.heroPanel} aria-label="LP preview">
              <div className={styles.heroImageFrame}>
                <LpHeroVideo
                  src="/lp_hero_movie.mp4"
                  className={styles.heroImage}
                />
              </div>
            </aside>
          </div>
          <p className={styles.trustLine}>{content.trustLine}</p>
          <div className={styles.chips}>
            {content.hero.chips.map((chip) => (
              <span key={chip} className={styles.chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.painsSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.painsSection.title}</h2>
          <div className={styles.painGrid}>
            {content.pains.map((item, index) => (
              <article key={item} className={styles.painCard}>
                <span className={styles.painIcon}>{painIcons[index] ?? painIcons[0]}</span>
                <p className={styles.painText}>{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWarm}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.solutionSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.solutionSection.title}</h2>
          <div className={styles.solutionSplit}>
            <div className={styles.solutionLeft}>
              <ul className={styles.solutionList}>
                {content.solutionPoints.map((item) => (
                  <li key={item} className={styles.solutionItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <aside className={styles.solutionVisual} aria-label="Solution preview">
              <img
                src="/solution-preview.svg"
                alt="AskPDF solution preview"
                className={styles.solutionImage}
              />
            </aside>
          </div>
        </div>
      </section>

      <section id="features" className={`${styles.section} ${styles.sectionBlue}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.featuresSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.featuresSection.title}</h2>
          <div className={styles.featureDetailGrid}>
            {content.featureDetails.map((item, index) => (
              <article key={item.title} className={styles.featureDetailCard}>
                <span className={styles.featureDetailIcon}>
                  {renderFeatureDetailIcon(item.id)}
                </span>
                <h3 className={styles.featureDetailTitle}>
                  {index + 1}. {item.title}
                </h3>
                <p className={styles.featureDetailText}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="steps" className={`${styles.section} ${styles.sectionPlain}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.stepsSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.stepsSection.title}</h2>
          <div className={styles.stepsSplit}>
            <aside className={styles.stepsVisual} aria-label="How it works preview">
              <img
                src="/how-to-use.jpg"
                alt="AskPDF workflow preview"
                className={styles.stepsVisualImage}
              />
            </aside>
            <div className={styles.stepsList}>
              {content.steps.map((step, index) => (
                <article key={step.title} className={styles.stepRow}>
                  <h3 className={styles.stepRowTitle}>
                    {step.title.replace(/^\d+\.\s*/, "")}
                  </h3>
                  <p className={styles.stepRowText}>{step.description}</p>
                  <span className={styles.stepRowIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="compare"
        className={`${styles.section} ${styles.sectionCool} ${styles.compareSection}`}
      >
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.comparisonSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.comparisonSection.title}</h2>
          <div className={styles.compareScroll}>
            <div className={styles.tableWrap}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th className={styles.compareHeaderCell}>{content.comparisonSection.headers.topic}</th>
                    <th className={styles.compareHeaderCell}>{content.comparisonSection.headers.legacy}</th>
                    <th className={styles.compareHeaderCell}>{content.comparisonSection.headers.askPdf}</th>
                  </tr>
                </thead>
                <tbody>
                  {content.comparisonRows.map((row) => (
                    <tr key={row.topic}>
                      <td className={styles.compareCell}>{row.topic}</td>
                      <td className={styles.compareCell}>{row.legacy}</td>
                      <td className={styles.compareCell}>{row.askPdf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className={`${styles.section} ${styles.sectionWarm} ${styles.pricingSection}`}
      >
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.pricingSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.pricingSection.title}</h2>
          <div className={styles.pricingGrid}>
            {content.plans.map((plan) => (
              <article
                key={plan.name}
                className={`${styles.pricingCard} ${
                  plan.featured ? styles.pricingCardFeatured : ""
                }`}
              >
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planPrice}>
                  <span className={styles.planPriceAmount}>{plan.priceAmount}</span>
                  <span className={styles.planPriceUnit}>{plan.priceUnit}</span>
                </p>
                <ul className={styles.planPoints}>
                  {plan.points.map((point) => (
                    <li key={point} className={styles.planPoint}>
                      {point}
                    </li>
                  ))}
                </ul>
                <LpSignupCta
                  label={plan.name === "Plus" ? content.pricingSection.cta.plus : content.pricingSection.cta.default}
                  locale={locale}
                  placement="pricing"
                  variant={plan.featured ? "primary" : "ghost"}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>{content.faqSection.kicker}</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>{content.faqSection.title}</h2>
          <div className={styles.faqList}>
            {content.faqs.map((faq, index) => (
              <details
                key={faq.question}
                className={styles.faqItem}
                name="lp-faq"
                open={index === 0}
              >
                <summary className={styles.faqSummary}>
                  <span className={styles.faqQuestion}>{content.faqSection.qPrefix} {faq.question}</span>
                  <span className={styles.faqToggle} aria-hidden="true">
                    <svg viewBox="0 0 20 20">
                      <path
                        d="m5 12 5-5 5 5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </summary>
                <p className={styles.faqAnswer}>{content.faqSection.aPrefix} {faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.footerCta}>
        <div className={`${styles.sectionInner} ${styles.footerPanel}`}>
          <p className={styles.footerNote}>{content.footer.note}</p>
          <LpSignupCta
            label={content.footer.cta}
            locale={locale}
            placement="footer"
          />
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <div className={styles.siteFooterInner}>
          <div className={styles.siteFooterBrand}>AskPDF</div>
          <div className={styles.siteFooterLinks}>
            <a href="#features" className={styles.siteFooterLink}>
              {content.footer.links.features}
            </a>
            <a href="#pricing" className={styles.siteFooterLink}>
              {content.footer.links.pricing}
            </a>
            <a href="#faq" className={styles.siteFooterLink}>
              {content.footer.links.faq}
            </a>
            <Link href="/tokushoho" locale="ja" className={styles.siteFooterLink}>
              {content.footer.links.legal}
            </Link>
            <a href={`/${locale}/terms`} className={styles.siteFooterLink}>
              {content.footer.links.terms}
            </a>
            <a href={`/${locale}/privacy-policy`} className={styles.siteFooterLink}>
              {content.footer.links.privacy}
            </a>
          </div>
          <div className={styles.siteFooterCopy}>© {new Date().getFullYear()} AskPDF</div>
        </div>
      </footer>
    </main>
  );
}
