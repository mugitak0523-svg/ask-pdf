import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

export default function robots(): MetadataRoute.Robots {
  const blockedPaths = routing.locales.flatMap((locale) => [
    `/${locale}/admin`,
    `/${locale}/app`,
  ]);
  blockedPaths.push("/admin", "/app");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: blockedPaths,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
