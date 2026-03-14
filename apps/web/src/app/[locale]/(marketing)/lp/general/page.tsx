import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { lpGeneralContent } from "@/content/lp/general";
import { Link } from "@/i18n/navigation";

import { LpSignupCta, LpViewTracker } from "./lp-events";
import { LpHeroVideo } from "./lp-hero-video";
import styles from "./page.module.css";

type LpPageProps = {
  params: {
    locale: string;
  };
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata({ params }: LpPageProps): Promise<Metadata> {
  const locale = params.locale || "ja";
  const title = "PDFを、参照箇所つきでAIに質問 | AskPDF";
  const description =
    "契約書・マニュアル・提案書・論文など、PDFの管理，閲覧を1画面で。参照箇所つき回答で確認作業を効率化。";
  const canonical = `${appUrl}/${locale}/lp/general`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ja: `${appUrl}/ja/lp/general`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "AskPDF",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

const faqPageLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: lpGeneralContent.faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
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

function renderFeatureDetailIcon(title: string) {
  switch (title) {
    case "PDF管理":
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
    case "PDF閲覧":
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
    case "タブ":
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
    case "アノテーションミニマップ":
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
    case "チャット":
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
    case "PDF検索":
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
    case "OCR":
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
    case "ショートカット":
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
  const locale = params.locale || "ja";
  if (locale !== "ja") {
    redirect(`/${locale}`);
  }

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
                <span className={styles.brand}>{lpGeneralContent.nav.brand}</span>
              </div>
            </Link>
            <div className={styles.navLinks}>
              <a href="#features" className={styles.navLink}>
                機能
              </a>
              <a href="#compare" className={styles.navLink}>
                比較
              </a>
              <a href="#pricing" className={styles.navLink}>
                料金
              </a>
              <a href="#faq" className={styles.navLink}>
                FAQ
              </a>
            </div>
            <div className={styles.navCta}>
              <LpSignupCta
                label={lpGeneralContent.nav.cta}
                locale={locale}
                placement="hero_secondary"
                variant="ghost"
              />
            </div>
          </div>

          <div className={styles.heroMain}>
            <div className={styles.heroLeft}>
              <h1 className={styles.heroTitle}>{lpGeneralContent.hero.title}</h1>
              <p className={styles.heroSubtitle}>{lpGeneralContent.hero.subtitle}</p>
              <div className={styles.ctaRow}>
                <LpSignupCta
                  label={lpGeneralContent.hero.primaryCta}
                  locale={locale}
                  placement="hero_primary"
                />
                <a
                  href="#pricing"
                  className={`${styles.ctaButton} ${styles.ctaButtonGhost} ${styles.secondaryCta}`}
                >
                  {lpGeneralContent.hero.secondaryCta}
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
          <p className={styles.trustLine}>{lpGeneralContent.trustLine}</p>
          <div className={styles.chips}>
            {lpGeneralContent.hero.chips.map((chip) => (
              <span key={chip} className={styles.chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionWhite}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Pain Points</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>よくある課題</h2>
          <div className={styles.painGrid}>
            {lpGeneralContent.pains.map((item, index) => (
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
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Solution</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>このサービスで解決できること</h2>
          <div className={styles.solutionSplit}>
            <div className={styles.solutionLeft}>
              <ul className={styles.solutionList}>
                {lpGeneralContent.solutionPoints.map((item) => (
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
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Features</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>主要機能</h2>
          <div className={styles.featureDetailGrid}>
            {lpGeneralContent.featureDetails.map((item, index) => (
              <article key={item.title} className={styles.featureDetailCard}>
                <span className={styles.featureDetailIcon}>
                  {renderFeatureDetailIcon(item.title)}
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
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>How It Works</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>使い方は3ステップ</h2>
          <div className={styles.stepsSplit}>
            <aside className={styles.stepsVisual} aria-label="How it works preview">
              <img
                src="/how-to-use.jpg"
                alt="AskPDF workflow preview"
                className={styles.stepsVisualImage}
              />
            </aside>
            <div className={styles.stepsList}>
              {lpGeneralContent.steps.map((step, index) => (
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

      <section id="compare" className={`${styles.section} ${styles.sectionCool}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Comparison</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>比較</h2>
          <div className={styles.tableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th className={styles.compareHeaderCell}>項目</th>
                  <th className={styles.compareHeaderCell}>従来のやり方</th>
                  <th className={styles.compareHeaderCell}>AskPDF</th>
                </tr>
              </thead>
              <tbody>
                {lpGeneralContent.comparisonRows.map((row) => (
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
      </section>

      <section id="pricing" className={`${styles.section} ${styles.sectionWarm}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Pricing</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>料金プラン</h2>
          <div className={styles.pricingGrid}>
            {lpGeneralContent.plans.map((plan) => (
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
                  label={plan.name === "Plus" ? "Plusを始める" : "無料で試す"}
                  locale={locale}
                  placement="pricing"
                  variant={plan.featured ? "primary" : "ghost"}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className={`${styles.section} ${styles.sectionBlue}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>FAQ</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>FAQ</h2>
          <div className={styles.faqList}>
            {lpGeneralContent.faqs.map((faq, index) => (
              <details
                key={faq.question}
                className={styles.faqItem}
                name="lp-faq"
                open={index === 0}
              >
                <summary className={styles.faqSummary}>
                  <span className={styles.faqQuestion}>Q. {faq.question}</span>
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
                <p className={styles.faqAnswer}>A. {faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.footerCta}>
        <div className={`${styles.sectionInner} ${styles.footerPanel}`}>
          <p className={styles.footerNote}>{lpGeneralContent.footer.note}</p>
          <LpSignupCta
            label={lpGeneralContent.footer.cta}
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
              機能
            </a>
            <a href="#pricing" className={styles.siteFooterLink}>
              料金
            </a>
            <a href="#faq" className={styles.siteFooterLink}>
              FAQ
            </a>
            <a href={`/${locale}/tokushoho`} className={styles.siteFooterLink}>
              特定商取引法に基づく表記
            </a>
            <a href={`/${locale}/terms`} className={styles.siteFooterLink}>
              利用規約
            </a>
            <a href={`/${locale}/privacy-policy`} className={styles.siteFooterLink}>
              プライバシーポリシー
            </a>
          </div>
          <div className={styles.siteFooterCopy}>© {new Date().getFullYear()} AskPDF</div>
        </div>
      </footer>
    </main>
  );
}
