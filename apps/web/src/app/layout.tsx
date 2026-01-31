import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "AskPDF",
  description: "AskPDF UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
