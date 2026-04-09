import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { getLegalBackLabel, getTokushoMd, isSupportedTokushoLocale } from "@/content/legal";
import { Link } from "@/i18n/navigation";

import { buildLegalMetadata } from "../legal-page-metadata";

export function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Metadata {
  return buildLegalMetadata("tokushoho", locale);
}

export default function TokushohoPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  if (!isSupportedTokushoLocale(locale)) {
    notFound();
  }

  const tokushoMd = getTokushoMd(locale);
  if (!tokushoMd) {
    notFound();
  }

  return (
    <main className="legal-page">
      <article className="legal-card">
        <div className="legal-card__header">
          <Link href="/" locale={locale} className="legal-card__back">
            {getLegalBackLabel(locale)}
          </Link>
        </div>
        <div className="markdown legal-card__body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {tokushoMd}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
