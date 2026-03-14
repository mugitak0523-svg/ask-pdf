import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "es", "fr", "de", "ko", "zh"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
