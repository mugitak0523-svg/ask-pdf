import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteUrl } from "@/lib/site.server";

const shareImage = "/icon.svg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AskPDF",
  description: "AskPDF App",
  openGraph: {
    title: "AskPDF",
    description: "AskPDF App",
    images: [
      {
        url: shareImage,
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
    description: "AskPDF App",
    images: [shareImage],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
    },
  },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
