import type { MetadataRoute } from "next";

import { getArticleLocales, getArticleSlugs } from "@/content/articles";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

const localizedLegalRoutes = ["/terms", "/privacy-policy"] as const;
const jaOnlyLegalRoutes = ["/tokushoho"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localizedHome = routing.locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const localizedLegal = routing.locales.flatMap((locale) =>
    localizedLegalRoutes.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }))
  );

  const jaOnlyLegal = jaOnlyLegalRoutes.map((path) => ({
    url: `${siteUrl}/ja${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  const localizedArticles = getArticleSlugs().flatMap((slug) =>
    getArticleLocales(slug).map((locale) => ({
      url: `${siteUrl}/${locale}/articles/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...localizedHome, ...localizedLegal, ...jaOnlyLegal, ...localizedArticles];
}
