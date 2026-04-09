import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getLegalBackLabel, getTermsMd } from "@/content/legal";
import { Link } from "@/i18n/navigation";

import { buildLegalMetadata } from "../legal-page-metadata";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  return buildLegalMetadata("terms", locale);
}

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const termsMd = getTermsMd(locale);
  const backLabel = getLegalBackLabel(locale);

  return (
    <main className="legal-page">
      <article className="legal-card">
        <div className="legal-card__header">
          <Link href="/" locale={locale} className="legal-card__back">
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
