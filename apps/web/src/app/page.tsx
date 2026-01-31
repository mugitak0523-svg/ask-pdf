"use client";

import { useMemo, useRef, useState } from "react";

const mockChats = [
  {
    title: "新しいチャット",
    updatedAt: "今",
    tags: ["AskPDF"],
  },
  {
    title: "チャットを検索",
    updatedAt: "最近",
    tags: ["History"],
  },
  {
    title: "画像",
    updatedAt: "テンプレ",
    tags: ["Media"],
  },
];

const mockMessages = [
  {
    role: "assistant",
    text: "この資料では売上成長率は前年比18%です。",
    refs: ["p.12", "p.13"],
  },
  {
    role: "user",
    text: "根拠のページを教えて",
  },
  {
    role: "assistant",
    text: "p.12の市場分析とp.13の売上推移グラフを参照しました。",
    refs: ["p.12", "p.13"],
  },
];

const samplePdfs = [
  "投資家向け説明資料.pdf",
  "社内規程_2024.pdf",
  "研究報告書_脳科学.pdf",
  "営業資料_エンタープライズ.pdf",
  "議事録_2025-01.pdf",
  "採用ガイドライン.pdf",
  "IR_プレゼン2024.pdf",
  "プロダクト要件定義.pdf",
  "開発ロードマップ.pdf",
  "顧客ヒアリング結果.pdf",
  "市場調査レポート.pdf",
  "競合比較_最新版.pdf",
  "UIデザインレビュー.pdf",
  "KPIレポート_Q4.pdf",
  "契約書ドラフト.pdf",
  "セキュリティ方針.pdf",
  "運用マニュアル.pdf",
  "FAQ_サポート.pdf",
  "社内研修資料.pdf",
  "技術仕様書_v2.pdf",
  "データ辞書.pdf",
  "障害報告_2024-12.pdf",
  "月次報告_2025-01.pdf",
  "財務諸表_2024.pdf",
  "プロジェクト計画書.pdf",
  "ユーザーインタビュー.pdf",
  "オンボーディング.pdf",
  "広報資料_新製品.pdf",
  "テスト計画.pdf",
  "リリースノート.pdf",
];

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const [chatWidth, setChatWidth] = useState(360);

  const mainStyle = useMemo(
    () => ({
      gridTemplateColumns: `minmax(0, 1fr) 6px ${chatWidth}px`,
    }),
    [chatWidth]
  );

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const onMove = (moveEvent: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nextWidth = rect.right - moveEvent.clientX;
      const maxWidth = rect.width / 2;
      const clamped = Math.min(Math.max(nextWidth, 280), maxWidth);
      setChatWidth(clamped);
    };
    const onUp = (upEvent: PointerEvent) => {
      target.releasePointerCapture(upEvent.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <main className="app">
      <section className="sidebar">
        <div className="sidebar__brand">
          <span className="logo">◎</span>
          <span className="brand">AskPDF</span>
        </div>

        <div className="sidebar__list">
          {samplePdfs.map((title) => (
            <button key={title} className="history-item">
              {title}
            </button>
          ))}
        </div>
      </section>

      <header className="topbar">
        <div className="viewer__breadcrumb">
          <span className="crumb">&nbsp;</span>
        </div>
        <div className="viewer__actions" />
      </header>

      <section className="main" style={mainStyle} ref={containerRef}>
        <section className="viewer">
          <div className="viewer__canvas">
            <article className="viewer__paper">
              <h2>被りチェック前提で最後に決定</h2>
              <ul>
                <li>キャッチコピー（行・LP用）</li>
                <li>サービス説明文（英語・30秒で理解できるやつ）</li>
              </ul>
              <p className="divider">どれ系で行く？</p>
              <div className="quote">一瞬で意味が伝わる</div>
              <h3>最有力（説明不要レベル）</h3>
              <ul>
                <li>AskPDF</li>
                <li>ChatWithPDF</li>
                <li>ChatPDF</li>
                <li>TalkToPDF</li>
                <li>AskYourPDF</li>
              </ul>
              <p className="note">📌 見た瞬間に「PDFに質問できる」と分かる。</p>
            </article>

            <div className="viewer__overlay">
              <span className="marker">p.12</span>
              <span className="marker">p.13</span>
            </div>
          </div>
        </section>

        <div
          className="resizer"
          role="separator"
          aria-orientation="vertical"
          onPointerDown={handleResizeStart}
        />

        <section className="chat">
          <div className="chat__messages">
            {mockMessages.map((msg, index) => (
              <div key={index} className={`bubble bubble--${msg.role}`}>
                <p>{msg.text}</p>
                {msg.refs ? (
                  <div className="refs">
                    {msg.refs.map((ref) => (
                      <span key={ref}>{ref}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form className="chat__input">
            <div className="input-row">
              <textarea placeholder="質問してみましょう" rows={2} />
              <button type="submit" className="send">
                ↑
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
