import { getRequestConfig } from "next-intl/server";

import { routing, type Locale } from "./routing";

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale) ?? routing.defaultLocale;
  const isSupportedLocale = (value: string): value is Locale =>
    routing.locales.includes(value as Locale);
  const resolvedLocale: Locale = isSupportedLocale(requested)
    ? requested
    : routing.defaultLocale;
  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
