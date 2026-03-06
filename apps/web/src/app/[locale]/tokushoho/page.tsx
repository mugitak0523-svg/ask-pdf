import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import { tokushoMd } from "@/content/legal";

export default function TokushohoPage() {
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
            {tokushoMd}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
