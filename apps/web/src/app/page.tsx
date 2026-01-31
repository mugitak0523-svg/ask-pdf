"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PdfEmbed } from "@/components/pdf-embed";
import { supabase } from "@/lib/supabase";

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
    refs: [
      { label: "p.12", id: "h-12-1" },
      { label: "p.13", id: "h-13-1" },
    ],
  },
  {
    role: "user",
    text: "根拠のページを教えて",
  },
  {
    role: "assistant",
    text: "p.12の市場分析とp.13の売上推移グラフを参照しました。",
    refs: [
      { label: "p.12", id: "h-12-2" },
      { label: "p.13", id: "h-13-2" },
    ],
  },
];

type DocumentItem = {
  id: string;
  title: string;
};

type OpenDocument = {
  id: string;
  title: string;
};

export default function Home() {
  const containerRef = useRef<HTMLElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabsWrapRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [chatWidth, setChatWidth] = useState(360);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(
    "h-12-1"
  );
  const [isAuthed, setIsAuthed] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [openDocuments, setOpenDocuments] = useState<OpenDocument[]>([]);
  const [tabsOverflow, setTabsOverflow] = useState(false);

  const mainStyle = useMemo(
    () => ({
      gridTemplateColumns: `minmax(0, 1fr) 6px ${chatWidth}px`,
    }),
    [chatWidth]
  );
  const topbarStyle = useMemo(
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(Boolean(data.session));
      if (data.session) {
        void loadDocuments(data.session.access_token);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
      if (session) {
        void loadDocuments(session.access_token);
      } else {
        setDocuments([]);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadDocuments = async (accessToken: string) => {
    setDocsLoading(true);
    setDocsError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load documents (${response.status})`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload.documents) ? payload.documents : [];
      setDocuments(
        items.map((item) => ({
          id: String(item.id),
          title: String(item.title ?? "Untitled"),
        }))
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load documents";
      setDocsError(message);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!isAuthed) return;
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setDocsError(null);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`${baseUrl}/documents/index`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      });
      if (!response.ok) {
        throw new Error(`Upload failed (${response.status})`);
      }
      await loadDocuments(accessToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setDocsError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectDocument = async (doc: DocumentItem) => {
    setSelectedDocumentId(doc.id);
    setSelectedDocumentTitle(doc.title);
    setOpenDocuments((prev) => {
      if (prev.some((item) => item.id === doc.id)) return prev;
      return [...prev, { id: doc.id, title: doc.title }];
    });
    setSelectedDocumentUrl(null);
    setViewerError(null);
    setViewerLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${doc.id}/signed-url`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load PDF (${response.status})`);
      }
      const payload = await response.json();
      const url = String(payload.signed_url ?? "");
      if (!url) {
        throw new Error("Signed URL is missing");
      }
      setSelectedDocumentUrl(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load PDF";
      setViewerError(message);
    } finally {
      setViewerLoading(false);
    }
  };

  const handleSelectTab = (docId: string) => {
    const doc = openDocuments.find((item) => item.id === docId);
    if (!doc) return;
    void handleSelectDocument({ id: doc.id, title: doc.title });
  };

  const handleCloseTab = (docId: string) => {
    setOpenDocuments((prev) => prev.filter((item) => item.id !== docId));
    if (selectedDocumentId === docId) {
      const remaining = openDocuments.filter((item) => item.id !== docId);
      if (remaining.length > 0) {
        const nextDoc = remaining[remaining.length - 1];
        void handleSelectDocument(nextDoc);
      } else {
        setSelectedDocumentId(null);
        setSelectedDocumentTitle(null);
        setSelectedDocumentUrl(null);
        setViewerError(null);
      }
    }
  };

  const scrollTabs = (direction: "left" | "right") => {
    const container = tabsRef.current;
    if (!container) return;
    const step = 200;
    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const container = tabsRef.current;
    const wrap = tabsWrapRef.current;
    if (!container || !wrap) return;
    const updateOverflow = () => {
      setTabsOverflow(container.scrollWidth > wrap.clientWidth + 1);
    };
    const raf = requestAnimationFrame(updateOverflow);
    const resizeObserver = new ResizeObserver(updateOverflow);
    resizeObserver.observe(wrap);
    window.addEventListener("resize", updateOverflow);
    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, [openDocuments.length, chatWidth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <main className={`app ${sidebarOpen ? "" : "app--sidebar-closed"}`}>
      <section className="sidebar">
        <div className="sidebar__header sidebar__header--primary">
          <span className="logo">◎</span>
        </div>

        <div className="sidebar__header sidebar__header--secondary">
          <button
            type="button"
            className="history-item header-btn"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <svg
              className="btn-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <span className="label">{sidebarOpen ? "閉じる" : "≡"}</span>
          </button>
          <button
            type="button"
            className={`history-item sidebar-upload ${uploading ? "is-uploading" : ""}`}
            onClick={handleUploadClick}
            disabled={!isAuthed || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner" aria-label="uploading" />
                <span className="label">アップロード中...</span>
              </>
            ) : (
              <>
                <svg
                  className="btn-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                <span className="label">{sidebarOpen ? "アップロード" : ""}</span>
              </>
            )}
          </button>
          <button type="button" className="history-item header-btn">
            <svg
              className="btn-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="label">検索</span>
          </button>
          <button type="button" className="history-item header-btn">
            <svg
              className="btn-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="16 3 21 3 21 8" />
              <line x1="21" y1="3" x2="13" y2="11" />
              <polyline points="8 21 3 21 3 16" />
              <line x1="3" y1="21" x2="11" y2="13" />
            </svg>
            <span className="label">切り替え</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="visually-hidden"
          />
        </div>

        <div className="sidebar__list">
          {isAuthed ? (
            docsLoading ? (
              <p className="auth-hint">読み込み中...</p>
            ) : docsError ? (
              <div className="auth-hint">
                <p>{docsError}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="auth-hint">
                <p>ドキュメントはまだありません</p>
              </div>
            ) : (
              documents.map((doc) => (
                <button
                  key={doc.id}
                  className="history-item"
                  onClick={() => handleSelectDocument(doc)}
                >
                  <span className="label">{doc.title}</span>
                </button>
              ))
            )
          ) : (
            <div className="auth-hint">
              <p>ログインするとPDF一覧が表示されます。</p>
              <Link className="ghost auth-link" href="/login">
                サインインへ
              </Link>
            </div>
          )}
        </div>

        <div className="sidebar__footer">
          {isAuthed ? (
            <button type="button" className="history-item" onClick={handleSignOut}>
              <svg
                className="btn-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21h-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="label">ログアウト</span>
            </button>
          ) : (
            <span className="auth-hint">ログインしてください</span>
          )}
        </div>
      </section>

      <div className="right-col">
      <header className="topbar" style={topbarStyle}>
        <div className="topbar__left">
          <div className="topbar__brand">
            <span className="brand">AskPDF</span>
          </div>
          <div className="topbar__doc">
            {selectedDocumentTitle ? (
              <span className="label">{selectedDocumentTitle}</span>
            ) : (
              <span className="label">PDF未選択</span>
            )}
          </div>
        </div>
        <div className="viewer__actions">
          {isAuthed ? (
            <>
              <span />
            </>
          ) : (
            <div className="auth-links">
              <Link className="ghost" href="/login">
                サインイン
              </Link>
              <Link className="primary" href="/signup">
                サインアップ
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="main" style={mainStyle} ref={containerRef}>
        <section className="viewer">
          <div
            className={`viewer__tabs-wrap ${tabsOverflow ? "is-overflow" : ""} ${
              openDocuments.length > 0 ? "" : "is-empty"
            }`}
            ref={tabsWrapRef}
          >
            <button
              type="button"
              className={`viewer__tabs-nav ${tabsOverflow ? "" : "is-hidden"}`}
              onClick={() => scrollTabs("left")}
              aria-label="scroll left"
            >
              ≪
            </button>
            <div className="viewer__tabs" ref={tabsRef}>
              {openDocuments.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={`viewer__tab ${
                    doc.id === selectedDocumentId ? "viewer__tab--active" : ""
                  }`}
                  onClick={() => handleSelectTab(doc.id)}
                >
                  <span className="viewer__tab-label">{doc.title}</span>
                  <span
                    className="viewer__tab-close"
                    role="button"
                    aria-label="close"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCloseTab(doc.id);
                    }}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`viewer__tabs-nav ${tabsOverflow ? "" : "is-hidden"}`}
              onClick={() => scrollTabs("right")}
              aria-label="scroll right"
            >
              ≫
            </button>
          </div>
          <div className="viewer__canvas">
            {viewerLoading ? (
              <div className="empty-state">読み込み中...</div>
            ) : viewerError ? (
              <div className="empty-state">{viewerError}</div>
            ) : selectedDocumentUrl ? (
              <PdfEmbed url={selectedDocumentUrl} />
            ) : (
              <div className="empty-state">PDFがここに表示されます</div>
            )}
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
                      <button
                        type="button"
                        key={ref.id}
                        className="ref"
                        onClick={() => setActiveHighlightId(ref.id)}
                      >
                        {ref.label}
                      </button>
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
      </div>
    </main>
  );
}
