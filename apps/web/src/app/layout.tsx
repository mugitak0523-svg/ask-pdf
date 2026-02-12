import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const ogImage = "/icon.svg";

export const metadata: Metadata = {
  title: "AskPDF",
  description: "AskPDF UI",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "AskPDF",
    description: "AskPDF UI",
    url: appUrl,
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
