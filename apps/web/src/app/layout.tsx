import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { getLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/site.server";

const ogImage = "/icon.svg";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "AskPDF",
  description: "AskPDF UI",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "AskPDF",
    description: "AskPDF UI",
    url: siteUrl,
    siteName: "AskPDF",
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "AskPDF",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AskPDF",
    description: "AskPDF UI",
    images: [ogImage],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale().catch(() => routing.defaultLocale);

  return (
    <html lang={locale}>
      <body>
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
