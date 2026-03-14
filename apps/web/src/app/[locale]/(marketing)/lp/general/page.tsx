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
      <path
        d="M10.5 4.5a6 6 0 1 0 3.78 10.66l4.28 4.28 1.44-1.44-4.28-4.28A6 6 0 0 0 10.5 4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.5h5M10.5 8v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 5.5 6v5.2c0 4.4 2.8 8.1 6.5 9.3 3.7-1.2 6.5-4.9 6.5-9.3V6L12 3.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12.1 1.8 1.8 3.8-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 7h10M13 3l4 4-4 4M17 17H7M11 21l-4-4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
];

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
          <p className={styles.sectionKicker}>Solution</p>
          <h2 className={styles.sectionTitle}>このサービスで解決できること</h2>
          <ul className={styles.solutionList}>
            {lpGeneralContent.solutionPoints.map((item) => (
              <li key={item} className={styles.solutionItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="features" className={`${styles.section} ${styles.sectionBlue}`}>
        <div className={`${styles.sectionInner} ${styles.sectionInnerBare}`}>
          <p className={`${styles.sectionKicker} ${styles.sectionHeadingCenter}`}>Features</p>
          <h2 className={`${styles.sectionTitle} ${styles.sectionHeadingCenter}`}>主要機能</h2>
          <div className={styles.featureGrid}>
            {lpGeneralContent.features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3 className={styles.cardTitle}>{feature.title}</h3>
                <p className={styles.cardText}>{feature.description}</p>
              </article>
            ))}
          </div>
          <details className={styles.featureMore}>
            <summary className={styles.featureMoreSummary}>もっとみる</summary>
            <ol className={styles.featureMoreList}>
              {lpGeneralContent.featureDetails.map((item, index) => (
                <li key={item.title} className={styles.featureMoreItem}>
                  <h3 className={styles.featureMoreTitle}>
                    {index + 1}. {item.title}
                  </h3>
                  <p className={styles.featureMoreText}>{item.description}</p>
                  {item.imageLabel ? (
                    <p className={styles.featureMoreImageLabel}>{item.imageLabel}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </details>
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
