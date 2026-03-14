import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { privacyMd } from "@/content/legal";

export default function PrivacyPolicyPage() {
  return (
    <main className="legal-page">
      <article className="legal-card">
        <div className="legal-card__header">
          <Link href="/" className="legal-card__back">
            ← ホームへ
          </Link>
        </div>
        <div className="markdown legal-card__body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {privacyMd}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
