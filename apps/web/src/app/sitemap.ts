import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const lpRoutes = ["/lp", "/lp/general"] as const;
const legalRoutes = ["/terms", "/privacy-policy", "/tokushoho"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const localizedHome = routing.locales.map((locale) => ({
    url: `${appUrl}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const localizedLp = routing.locales.flatMap((locale) =>
    lpRoutes.map((path) => ({
      url: `${appUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/lp/general" ? 1 : 0.8,
    }))
  );

  const localizedLegal = routing.locales.flatMap((locale) =>
    legalRoutes.map((path) => ({
      url: `${appUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }))
  );

  return [...localizedHome, ...localizedLp, ...localizedLegal];
}
