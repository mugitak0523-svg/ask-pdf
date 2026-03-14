import deContent from "../../../messages/lp/general/de.json";
import enContent from "../../../messages/lp/general/en.json";
import esContent from "../../../messages/lp/general/es.json";
import frContent from "../../../messages/lp/general/fr.json";
import jaContent from "../../../messages/lp/general/ja.json";
import koContent from "../../../messages/lp/general/ko.json";
import zhContent from "../../../messages/lp/general/zh.json";

export type LpComparisonRow = {
  topic: string;
  legacy: string;
  askPdf: string;
};

export type LpFaqItem = {
  question: string;
  answer: string;
};

export type LpFeatureDetailItem = {
  id:
    | "pdf_management"
    | "pdf_viewing"
    | "tabs"
    | "annotation_minimap"
    | "chat"
    | "pdf_search"
    | "ocr"
    | "shortcut";
  title: string;
  description: string;
};

export type LpStepItem = {
  title: string;
  description: string;
};

export type LpPlanItem = {
  name: string;
  priceAmount: string;
  priceUnit: string;
  featured?: boolean;
  points: string[];
};

export type LpGeneralContent = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    brand: string;
    cta: string;
    links: {
      features: string;
      compare: string;
      pricing: string;
      faq: string;
    };
    langLabel: string;
  };
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    chips: string[];
  };
  trustLine: string;
  painsSection: {
    kicker: string;
    title: string;
  };
  pains: string[];
  solutionSection: {
    kicker: string;
    title: string;
  };
  solutionPoints: string[];
  featuresSection: {
    kicker: string;
    title: string;
  };
  featureDetails: LpFeatureDetailItem[];
  stepsSection: {
    kicker: string;
    title: string;
  };
  steps: LpStepItem[];
  comparisonSection: {
    kicker: string;
    title: string;
    headers: {
      topic: string;
      legacy: string;
      askPdf: string;
    };
  };
  comparisonRows: LpComparisonRow[];
  pricingSection: {
    kicker: string;
    title: string;
    cta: {
      plus: string;
      default: string;
    };
  };
  plans: LpPlanItem[];
  faqSection: {
    kicker: string;
    title: string;
    qPrefix: string;
    aPrefix: string;
  };
  faqs: LpFaqItem[];
  footer: {
    note: string;
    cta: string;
    links: {
      features: string;
      pricing: string;
      faq: string;
      legal: string;
      terms: string;
      privacy: string;
    };
  };
};

const lpGeneralContents: Record<string, LpGeneralContent> = {
  ja: jaContent as LpGeneralContent,
  en: enContent as LpGeneralContent,
  es: esContent as LpGeneralContent,
  fr: frContent as LpGeneralContent,
  de: deContent as LpGeneralContent,
  ko: koContent as LpGeneralContent,
  zh: zhContent as LpGeneralContent,
};

export function getLpGeneralContent(locale: string): LpGeneralContent {
  return lpGeneralContents[locale] ?? lpGeneralContents.en;
}
