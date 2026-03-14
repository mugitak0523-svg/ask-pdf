import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const legalRoutes = ["/terms", "/privacy-policy", "/tokushoho"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localizedHome = routing.locales.map((locale) => ({
    url: `${appUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const localizedLegal = routing.locales.flatMap((locale) =>
    legalRoutes.map((path) => ({
      url: `${appUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }))
  );

  return [...localizedHome, ...localizedLegal];
}
