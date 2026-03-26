import {
  privacyEnMd,
  privacyMd,
  termsEnMd,
  termsMd,
  tokushoMd,
} from "./legal.generated";

export { privacyEnMd, privacyMd, termsEnMd, termsMd, tokushoMd };

export function getTermsMd(locale: string) {
  return locale === "ja" ? termsMd : termsEnMd;
}

export function getPrivacyMd(locale: string) {
  return locale === "ja" ? privacyMd : privacyEnMd;
}
