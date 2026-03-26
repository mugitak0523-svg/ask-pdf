import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getPrivacyMd } from "@/content/legal";

export default function PrivacyPolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const privacyMd = getPrivacyMd(locale);
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
            {privacyMd}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
