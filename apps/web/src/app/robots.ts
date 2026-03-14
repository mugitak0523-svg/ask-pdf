import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  const blockedPaths = routing.locales.flatMap((locale) => [
    `/${locale}/admin`,
    `/${locale}/app`,
    `/${locale}/login`,
    `/${locale}/signup`,
    `/${locale}/reset`,
  ]);
  blockedPaths.push("/admin");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: blockedPaths,
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
