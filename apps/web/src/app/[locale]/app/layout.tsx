import type { Metadata } from "next";
import type { ReactNode } from "react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const shareImage = "/icon.svg";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
