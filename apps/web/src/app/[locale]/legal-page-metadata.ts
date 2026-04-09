import type { Metadata } from "next";

import {
  getLegalPageCopy,
  getLegalPageLocales,
  getLegalPath,
  getTokushoPageCopy,
  type LegalPageKey,
} from "@/content/legal";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

export function buildLegalMetadata(page: LegalPageKey, locale: string): Metadata {
  const copy = page === "tokushoho" ? getTokushoPageCopy() : getLegalPageCopy(page, locale);
  const canonical = `${siteUrl}${getLegalPath(page, locale)}`;
  const languages: Record<string, string> = Object.fromEntries(
    getLegalPageLocales(page).map((item) => [item, `${siteUrl}${getLegalPath(page, item)}`])
  );

  if (page !== "tokushoho") {
    languages["x-default"] = `${siteUrl}${getLegalPath(page, routing.defaultLocale)}`;
  }

  return {
    metadataBase: new URL(siteUrl),
    title: `${copy.title} | AskPDF`,
    description: copy.description,
    alternates: {
      canonical,
      languages,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
