import {
  privacyDeMd,
  privacyEnMd,
  privacyEsMd,
  privacyFrMd,
  privacyKoMd,
  privacyMd,
  privacyZhMd,
  termsDeMd,
  termsEnMd,
  termsEsMd,
  termsFrMd,
  termsKoMd,
  termsMd,
  tokushoMd,
  termsZhMd,
} from "./legal.generated";

import { routing, type Locale } from "@/i18n/routing";

export type LegalPageKey = "terms" | "privacy" | "tokushoho";

export {
  privacyDeMd,
  privacyEnMd,
  privacyEsMd,
  privacyFrMd,
  privacyKoMd,
  privacyMd,
  privacyZhMd,
  termsDeMd,
  termsEnMd,
  termsEsMd,
  termsFrMd,
  termsKoMd,
  termsMd,
  termsZhMd,
  tokushoMd,
};

export const legalPagePathByKey = {
  terms: "/terms",
  privacy: "/privacy-policy",
  tokushoho: "/tokushoho",
} as const satisfies Record<LegalPageKey, string>;

const termsByLocale: Record<Locale, string> = {
  ja: termsMd,
  en: termsEnMd,
  es: termsEsMd,
  fr: termsFrMd,
  de: termsDeMd,
  ko: termsKoMd,
  zh: termsZhMd,
};

const privacyByLocale: Record<Locale, string> = {
  ja: privacyMd,
  en: privacyEnMd,
  es: privacyEsMd,
  fr: privacyFrMd,
  de: privacyDeMd,
  ko: privacyKoMd,
  zh: privacyZhMd,
};

const backLabelByLocale: Record<Locale, string> = {
  ja: "← ホームへ",
  en: "← Back to home",
  es: "← Volver al inicio",
  fr: "← Retour à l'accueil",
  de: "← Zur Startseite",
  ko: "← 홈으로 돌아가기",
  zh: "← 返回首页",
};

const legalPageCopy = {
  terms: {
    ja: { title: "利用規約", description: "AskPDFの利用規約です。" },
    en: { title: "Terms of Service", description: "Terms of Service for AskPDF." },
    es: { title: "Términos del Servicio", description: "Términos del Servicio de AskPDF." },
    fr: { title: "Conditions d'utilisation", description: "Conditions d'utilisation d'AskPDF." },
    de: { title: "Nutzungsbedingungen", description: "Nutzungsbedingungen für AskPDF." },
    ko: { title: "서비스 이용약관", description: "AskPDF 서비스 이용약관입니다." },
    zh: { title: "服务条款", description: "AskPDF 的服务条款。" },
  },
  privacy: {
    ja: { title: "プライバシーポリシー", description: "AskPDFのプライバシーポリシーです。" },
    en: { title: "Privacy Policy", description: "Privacy Policy for AskPDF." },
    es: { title: "Política de Privacidad", description: "Política de Privacidad de AskPDF." },
    fr: { title: "Politique de confidentialité", description: "Politique de confidentialité d'AskPDF." },
    de: { title: "Datenschutzrichtlinie", description: "Datenschutzrichtlinie für AskPDF." },
    ko: { title: "개인정보처리방침", description: "AskPDF 개인정보처리방침입니다." },
    zh: { title: "隐私政策", description: "AskPDF 的隐私政策。" },
  },
  tokushoho: {
    ja: {
      title: "特定商取引法に基づく表記",
      description: "AskPDFの特定商取引法に基づく表記です。",
    },
  },
} as const;

function isSupportedLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export function resolveLocale(locale: string): Locale {
  return isSupportedLocale(locale) ? locale : routing.defaultLocale;
}

export function getTermsMd(locale: string) {
  return termsByLocale[resolveLocale(locale)];
}

export function getPrivacyMd(locale: string) {
  return privacyByLocale[resolveLocale(locale)];
}

export function getTokushoMd(locale: string) {
  return locale === "ja" ? tokushoMd : null;
}

export function isSupportedTokushoLocale(locale: string) {
  return locale === "ja";
}

export function getLegalBackLabel(locale: string) {
  return backLabelByLocale[resolveLocale(locale)];
}

export function getLegalPageCopy(page: "terms" | "privacy", locale: string) {
  return legalPageCopy[page][resolveLocale(locale)];
}

export function getTokushoPageCopy() {
  return legalPageCopy.tokushoho.ja;
}

export function getLegalPageLocales(page: LegalPageKey) {
  return page === "tokushoho" ? (["ja"] as const) : routing.locales;
}

export function getLegalPath(page: LegalPageKey, locale: string) {
  const targetLocale = page === "tokushoho" ? "ja" : resolveLocale(locale);
  return `/${targetLocale}${legalPagePathByKey[page]}`;
}
