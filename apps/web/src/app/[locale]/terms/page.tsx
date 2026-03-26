import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getTermsMd } from "@/content/legal";

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const termsMd = getTermsMd(locale);
  const backLabel = locale === "ja" ? "← ホームへ" : "← Back to home";

  return (
    <main className="legal-page">
      <article className="legal-card">
        <div className="legal-card__header">
          <Link href="/" className="legal-card__back">
            {backLabel}
          </Link>
        </div>
        <div className="markdown legal-card__body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {termsMd}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
