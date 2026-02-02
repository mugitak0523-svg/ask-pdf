"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { PdfViewer } from "@/components/pdf-viewer/pdf-viewer";
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

type ChatRef = {
  label: string;
  id: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  refs?: ChatRef[];
  createdAt: string;
  status?: "loading" | "error" | "stopped";
};

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
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [chatWidth, setChatWidth] = useState(360);
  const [chatInput, setChatInput] = useState("");
  const [chatMode, setChatMode] = useState<"fast" | "standard" | "think">("standard");
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const [showChatJump, setShowChatJump] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatSending, setChatSending] = useState(false);
  const chatSocketRef = useRef<WebSocket | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const chatMessagesAbortRef = useRef<AbortController | null>(null);
  const chatsAbortRef = useRef<AbortController | null>(null);
  const allChatsAbortRef = useRef<AbortController | null>(null);
  const documentsAbortRef = useRef<AbortController | null>(null);
  const signedUrlAbortRef = useRef<AbortController | null>(null);

  const scrollChatToBottom = (behavior: ScrollBehavior = "auto") => {
    const target = chatMessagesRef.current;
    if (!target) return;
    const bottom = Math.max(0, target.scrollHeight - target.clientHeight);
    target.scrollTo({ top: bottom, behavior });
  };
  const [chatThreads, setChatThreads] = useState<
    { id: string; title: string | null; updatedAt: string | null; lastMessage?: string | null }[]
  >([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showThreadList, setShowThreadList] = useState(false);
  const [allChatThreads, setAllChatThreads] = useState<
    {
      id: string;
      title: string | null;
      documentId: string;
      documentTitle: string | null;
      lastMessage?: string | null;
      updatedAt: string | null;
    }[]
  >([]);
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
  const [selectedDocumentToken, setSelectedDocumentToken] = useState<string | null>(null);
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

  const resizeChatInput = () => {
    const el = chatInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const styles = window.getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight || "0");
    const paddingTop = Number.parseFloat(styles.paddingTop || "0");
    const paddingBottom = Number.parseFloat(styles.paddingBottom || "0");
    const maxHeight = lineHeight * 3 + paddingTop + paddingBottom;
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
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
        if (selectedDocumentId) {
          void loadChats(selectedDocumentId, session.access_token);
        } else {
          void loadAllChats(session.access_token);
        }
      } else {
        setDocuments([]);
        setChatMessages([]);
        setChatError(null);
        setChatThreads([]);
        setActiveChatId(null);
        setAllChatThreads([]);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    resizeChatInput();
  }, [chatInput]);

  useEffect(() => {
    const target = chatMessagesRef.current;
    if (!target) return;
    const onScroll = () => {
      const threshold = 16;
      const distance =
        target.scrollHeight - target.scrollTop - target.clientHeight;
      setShowChatJump(distance > threshold);
      isNearBottomRef.current = distance <= 120;
    };
    onScroll();
    target.addEventListener("scroll", onScroll);
    return () => {
      target.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (showThreadList || !selectedDocumentId || chatMessages.length === 0) {
      setShowChatJump(false);
    }
  }, [showThreadList, selectedDocumentId, chatMessages.length]);

  useEffect(() => {
    if (showThreadList || chatMessages.length === 0) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollChatToBottom("auto");
        isNearBottomRef.current = true;
      });
    });
  }, [showThreadList, chatMessages.length]);

  const loadChatMessages = async (
    documentId: string,
    chatId: string,
    accessToken: string
  ) => {
    setChatLoading(true);
    setChatError(null);
    try {
      chatMessagesAbortRef.current?.abort();
      const controller = new AbortController();
      chatMessagesAbortRef.current = controller;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${documentId}/chats/${chatId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to load chat messages (${response.status})`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload.messages) ? payload.messages : [];
      const messages = items.map((item: ChatMessage) => ({
        id: String(item.id),
        role: item.role === "assistant" ? "assistant" : "user",
        text:
          item.status === "error" && !item.text
            ? "回答の生成に失敗しました"
            : String(item.text ?? ""),
        status:
          item.status === "error"
            ? "error"
            : item.status === "stopped"
              ? "stopped"
              : undefined,
        refs: Array.isArray(item.refs) ? item.refs : undefined,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }));
      setChatMessages(messages);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollChatToBottom("auto");
          isNearBottomRef.current = true;
        });
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message =
        error instanceof Error ? error.message : "Failed to load chat messages";
      setChatError(message);
    } finally {
      if (chatMessagesAbortRef.current) {
        chatMessagesAbortRef.current = null;
      }
      setChatLoading(false);
    }
  };

  const loadChats = async (
    documentId: string,
    accessToken: string,
    options: { autoOpen?: boolean } = {}
  ) => {
    const { autoOpen = true } = options;
    setChatError(null);
    try {
      chatsAbortRef.current?.abort();
      const controller = new AbortController();
      chatsAbortRef.current = controller;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${documentId}/chats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load chats (${response.status})`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload.chats) ? payload.chats : [];
      const threads = items.map(
        (item: {
          id: string;
          title?: string | null;
          updated_at?: string | null;
          last_message?: string | null;
        }) => ({
          id: String(item.id),
          title: item.title ?? null,
          updatedAt: item.updated_at ?? null,
          lastMessage: item.last_message ?? null,
        })
      );
      if (threads.length === 0) {
        setChatThreads([]);
        setActiveChatId(null);
        setChatMessages([]);
        setShowThreadList(true);
      } else {
        setChatThreads(threads);
        if (autoOpen) {
          const nextChatId = threads[0].id;
          setActiveChatId(nextChatId);
          setShowThreadList(false);
          await loadChatMessages(documentId, nextChatId, accessToken);
        } else {
          setShowThreadList(true);
        }
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load chats";
      setChatError(message);
      setChatThreads([]);
      setActiveChatId(null);
      setChatMessages([]);
    } finally {
      if (chatsAbortRef.current) {
        chatsAbortRef.current = null;
      }
    }
  };

  const loadAllChats = async (accessToken: string) => {
    setChatError(null);
    try {
      allChatsAbortRef.current?.abort();
      const controller = new AbortController();
      allChatsAbortRef.current = controller;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/chats`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load chats (${response.status})`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload.chats) ? payload.chats : [];
      setAllChatThreads(
        items.map(
          (item: {
            id: string;
            title?: string | null;
            documentId: string;
            documentTitle?: string | null;
            lastMessage?: string | null;
            updatedAt?: string | null;
          }) => ({
            id: String(item.id),
            title: item.title ?? null,
            documentId: String(item.documentId),
            documentTitle: item.documentTitle ?? null,
            lastMessage: item.lastMessage ?? null,
            updatedAt: item.updatedAt ?? null,
          })
        )
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load chats";
      setChatError(message);
      setAllChatThreads([]);
    } finally {
      if (allChatsAbortRef.current) {
        allChatsAbortRef.current = null;
      }
    }
  };

  const createChat = async (
    documentId: string,
    accessToken: string,
    title: string
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${baseUrl}/documents/${documentId}/chats`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
      }),
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    const chatId = String(payload.chat_id ?? "");
    if (!chatId) return null;
    return { id: chatId, title, updatedAt: new Date().toISOString() };
  };

  const loadDocuments = async (accessToken: string) => {
    setDocsLoading(true);
    setDocsError(null);
    try {
      documentsAbortRef.current?.abort();
      const controller = new AbortController();
      documentsAbortRef.current = controller;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
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
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load documents";
      setDocsError(message);
    } finally {
      if (documentsAbortRef.current) {
        documentsAbortRef.current = null;
      }
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
    setChatMessages([]);
    setChatThreads([]);
    setActiveChatId(null);
    setShowThreadList(false);
    setAllChatThreads([]);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      setSelectedDocumentToken(accessToken);
      void loadChats(doc.id, accessToken);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      signedUrlAbortRef.current?.abort();
      const controller = new AbortController();
      signedUrlAbortRef.current = controller;
      const response = await fetch(`${baseUrl}/documents/${doc.id}/signed-url`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
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
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load PDF";
      setViewerError(message);
    } finally {
      if (signedUrlAbortRef.current) {
        signedUrlAbortRef.current = null;
      }
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
        setChatMessages([]);
        setChatThreads([]);
        setActiveChatId(null);
        supabase.auth.getSession().then(({ data }) => {
          const accessToken = data.session?.access_token;
          if (accessToken) {
            void loadAllChats(accessToken);
          }
        });
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

  const activeChatTitle = selectedDocumentId
    ? showThreadList
      ? "このPDFのチャット一覧"
      : chatThreads.find((thread) => thread.id === activeChatId)?.title ??
        (activeChatId ? "新しいチャット" : "チャット")
    : "全体チャット一覧";

  const formatRelativeTime = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return "今";
    if (diffMinutes < 60) {
      const rounded = Math.max(1, Math.round(diffMinutes / 5) * 5);
      return `${rounded}分前`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      const rounded = Math.max(1, Math.round(diffHours));
      return `${rounded}時間前`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      const rounded = Math.max(1, Math.round(diffDays));
      return `${rounded}日前`;
    }
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      const rounded = Math.max(1, Math.round(diffMonths));
      return `${rounded}ヶ月前`;
    }
    const diffYears = Math.floor(diffMonths / 12);
    return `${Math.max(1, diffYears)}年前`;
  };


  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (chatSending) return;
    if (!selectedDocumentId || !activeChatId) return;
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
    setChatInput("");
    void requestAssistantReply(trimmed);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${selectedDocumentId}/chats/${activeChatId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role: "user",
            text: trimmed,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to send message (${response.status})`);
      }
      const payload = await response.json();
      const saved = payload?.message;
      if (saved?.id) {
        setChatMessages((prev) =>
          prev.map((item) =>
            item.id === message.id
              ? {
                  ...item,
                  id: String(saved.id),
                  createdAt: String(saved.createdAt ?? item.createdAt),
                }
              : item
          )
        );
      }
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to send message";
      setChatError(messageText);
    }
  };

  const requestAssistantReply = async (
    question: string,
    options: { existingId?: string } = {}
  ) => {
    if (!selectedDocumentId || !activeChatId) return;
    const pendingId = options.existingId ?? crypto.randomUUID();
    const pending: ChatMessage = {
      id: pendingId,
      role: "assistant",
      text: "",
      createdAt: new Date().toISOString(),
      status: "loading",
    };
    setChatMessages((prev) =>
      options.existingId
        ? prev.map((item) => (item.id === pendingId ? pending : item))
        : [...prev, pending]
    );
    setChatSending(true);
    setChatError(null);
    streamingMessageIdRef.current = pendingId;
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const wsUrl = `${baseUrl.replace(/^http/, "ws")}/documents/${selectedDocumentId}/chats/${activeChatId}/assistant/ws?token=${encodeURIComponent(
        accessToken
      )}`;
      await new Promise<void>((resolve, reject) => {
        const socket = new WebSocket(wsUrl);
        chatSocketRef.current = socket;
        const payload = JSON.stringify({
          message: question,
          message_id: options.existingId ?? null,
          mode: chatMode,
        });
        socket.addEventListener("open", () => {
          socket.send(payload);
        });
        socket.addEventListener("message", (event) => {
          let data: any = null;
          try {
            data = JSON.parse(String(event.data));
          } catch {
            data = null;
          }
          if (!data || typeof data !== "object") return;
          if (data.type === "delta") {
            const deltaText = String(data.delta ?? "");
            if (!deltaText) return;
            setChatMessages((prev) =>
              prev.map((item) =>
                item.id === pendingId
                  ? {
                      ...item,
                      text: `${item.text ?? ""}${deltaText}`,
                    }
                  : item
              )
            );
          } else if (data.type === "message") {
            const saved = data.message;
            if (saved?.id) {
              const status = saved.status === "error" ? "error" : undefined;
              const text =
                status === "error" && !saved.text
                  ? "回答の生成に失敗しました"
                  : String(saved.text ?? "");
              setChatMessages((prev) =>
                prev.map((item) =>
                  item.id === pendingId
                    ? {
                        id: String(saved.id),
                        role: "assistant",
                        text,
                        status,
                        refs: Array.isArray(saved.refs) ? saved.refs : undefined,
                        createdAt: String(saved.createdAt ?? item.createdAt),
                      }
                    : item
                )
              );
            }
          } else if (data.type === "error") {
            setChatMessages((prev) =>
              prev.map((item) =>
                item.id === pendingId
                  ? {
                      ...item,
                      text: "回答の生成に失敗しました",
                      status: "error",
                    }
                  : item
              )
            );
          } else if (data.type === "done") {
            socket.close();
            resolve();
          }
        });
        socket.addEventListener("error", () => {
          socket.close();
          reject(new Error("WebSocket error"));
        });
        socket.addEventListener("close", (event) => {
          chatSocketRef.current = null;
          streamingMessageIdRef.current = null;
          if (event.code !== 1000) {
            reject(new Error("WebSocket closed"));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to generate answer";
      setChatError(messageText);
      setChatMessages((prev) =>
        prev.map((item) =>
          item.id === pendingId
            ? {
                ...item,
                text: "回答の生成に失敗しました",
                status: "error",
              }
            : item
        )
      );
    } finally {
      setChatSending(false);
    }
  };

  const handleStopStreaming = () => {
    if (chatSocketRef.current) {
      chatSocketRef.current.close(1000, "stopped");
      chatSocketRef.current = null;
    }
    const targetId = streamingMessageIdRef.current;
    if (!targetId) return;
    setChatMessages((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? {
              ...item,
              status: "stopped",
            }
          : item
      )
    );
    setChatSending(false);
    streamingMessageIdRef.current = null;
  };

  const renderLoadingText = (text: string) => (
    <span className="loading-fade" aria-label={text}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={{ ["--fade-delay" as React.CSSProperties["--fade-delay"]]: `${index * 0.08}s` }}
        >
          {char}
        </span>
      ))}
    </span>
  );

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleCreateChat = async () => {
    if (!selectedDocumentId) return;
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    if (!accessToken) return;
    const nextIndex = chatThreads.length + 1;
    const title = `新しいチャット${nextIndex}`;
    const created = await createChat(selectedDocumentId, accessToken, title);
    if (!created) return;
    setChatThreads((prev) => [created, ...prev]);
    setActiveChatId(created.id);
    setChatMessages([]);
    setShowThreadList(false);
    await loadChatMessages(selectedDocumentId, created.id, accessToken);
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
              width="18"
              height="18"
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
                  width="18"
                  height="18"
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
              width="18"
              height="18"
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
              width="18"
              height="18"
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
              <p className="auth-hint">{renderLoadingText("Loading...")}</p>
            ) : docsError ? (
              <div className="auth-hint">
                <p>エラーが発生しました</p>
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
                width="18"
                height="18"
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
          ) : null}
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
          <button type="button" className="icon-btn" aria-label="settings">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button type="button" className="icon-btn" aria-label="messages">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
          </button>
          <button type="button" className="icon-btn" aria-label="account">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20a8 8 0 0 1 16 0" />
            </svg>
          </button>
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
              <div className="empty-state">{renderLoadingText("Loading...")}</div>
            ) : viewerError ? (
              <div className="empty-state">エラーが発生しました</div>
            ) : selectedDocumentUrl ? (
              <PdfViewer
                url={selectedDocumentUrl}
                documentId={selectedDocumentId}
                accessToken={selectedDocumentToken}
                onAddToChat={(text) => {
                  setChatInput((prev) => {
                    const prefix = prev.trim().length > 0 ? "\n" : "";
                    return `${prev}${prefix}"${text}"`;
                  });
                }}
              />
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
          <div className="chat__header">
            {selectedDocumentId ? (
              <div className="chat__header-left">
                {showThreadList ? null : (
                  <button
                    type="button"
                    className="chat__header-action"
                    aria-label="back"
                    onClick={async () => {
                      setShowThreadList(true);
                      const session = await supabase.auth.getSession();
                      const accessToken = session.data.session?.access_token;
                      if (accessToken && selectedDocumentId) {
                        await loadChats(selectedDocumentId, accessToken, { autoOpen: false });
                      }
                    }}
                  >
                    ←
                  </button>
                )}
                <span className="chat__header-title">{activeChatTitle}</span>
              </div>
            ) : (
              <div className="chat__header-left">
                <span className="chat__header-title">{activeChatTitle}</span>
              </div>
            )}
            <div className="chat__header-actions">
              {selectedDocumentId ? (
                <>
                  <button
                    type="button"
                    className="chat__header-action"
                    aria-label="new thread"
                    onClick={handleCreateChat}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                      <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415" />
                      <path d="M16 5l3 3" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="chat__header-action"
                    aria-label="settings"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" />
                      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                    </svg>
                  </button>
                  {showThreadList ? null : (
                    <button
                      type="button"
                      className="chat__header-action"
                      aria-label="history"
                      onClick={async () => {
                        setShowThreadList(true);
                        const session = await supabase.auth.getSession();
                        const accessToken = session.data.session?.access_token;
                        if (accessToken && selectedDocumentId) {
                          await loadChats(selectedDocumentId, accessToken, { autoOpen: false });
                        }
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 8l0 4l2 2" />
                        <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
                      </svg>
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="chat__header-action"
                  aria-label="settings"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" />
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  </svg>
                </button>
              )}
            </div>
          </div>
                <div className="chat__messages-wrap">
            <div
              className={`chat__messages ${
                !selectedDocumentId || showThreadList ? "is-thread-list" : ""
              }`}
              ref={chatMessagesRef}
            >
              {chatLoading ? (
                <div className="empty-state">{renderLoadingText("Loading...")}</div>
              ) : chatError ? (
                <div className="empty-state">エラーが発生しました</div>
              ) : !selectedDocumentId ? (
                allChatThreads.length === 0 ? (
                  <div className="empty-state">チャットはまだありません</div>
                ) : (
                  <div className="chat__thread-list">
                    {allChatThreads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        className="chat__thread-item"
                        onClick={() =>
                          handleSelectDocument({
                            id: thread.documentId,
                            title: thread.documentTitle ?? "Untitled",
                          })
                        }
                      >
                        <div className="chat__thread-row">
                          <div className="chat__thread-title">
                            {thread.title ?? "新しいチャット"}
                          </div>
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                        </div>
                        <div className="chat__thread-meta">
                          {thread.documentTitle ?? "Untitled"}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : showThreadList ? (
                chatThreads.length === 0 ? (
                  <div className="empty-state">このPDFのチャットはありません</div>
                ) : (
                  <div className="chat__thread-list">
                    {chatThreads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        className="chat__thread-item"
                        onClick={async () => {
                          chatsAbortRef.current?.abort();
                          setActiveChatId(thread.id);
                          setShowThreadList(false);
                          const session = await supabase.auth.getSession();
                          const accessToken = session.data.session?.access_token;
                          if (accessToken && selectedDocumentId) {
                            await loadChatMessages(selectedDocumentId, thread.id, accessToken);
                          }
                        }}
                      >
                        <div className="chat__thread-row">
                          <div className="chat__thread-title">
                            {thread.title ?? "新しいチャット"}
                          </div>
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                        </div>
                        <div className="chat__thread-meta">
                          {thread.lastMessage ?? "メッセージはまだありません"}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : chatMessages.length === 0 ? (
                <div className="empty-state">
                  {selectedDocumentId ? "チャットはまだありません" : "PDFを選択してください"}
                </div>
              ) : (
                chatMessages.map((msg, index) => {
                  const isLatest = index === chatMessages.length - 1;
                  const previousUserMessage = isLatest
                    ? [...chatMessages]
                        .slice(0, index)
                        .reverse()
                        .find((item) => item.role === "user")
                    : undefined;
                  return (
                  <div key={msg.id} className={`bubble bubble--${msg.role}`}>
                    {msg.status === "loading" ? (
                      msg.text ? (
                        <div className="bubble__content markdown">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{renderLoadingText("回答中...")}</p>
                      )
                    ) : msg.status === "error" || msg.status === "stopped" ? (
                      <div className="bubble__row">
                        <p className="bubble__content">{msg.text}</p>
                        {msg.status === "stopped" ? (
                          <p className="bubble__stopped">（生成をストップしました）</p>
                        ) : null}
                        {isLatest && previousUserMessage?.text ? (
                          <button
                            type="button"
                            className="bubble__retry"
                            onClick={() =>
                              requestAssistantReply(previousUserMessage.text, {
                                existingId: msg.id,
                              })
                            }
                            aria-label="retry"
                          >
                            <svg
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
                              <polyline points="1 4 1 10 7 10" />
                              <path d="M3.51 15a9 9 0 1 0 .49-9.36L1 10" />
                            </svg>
                          </button>
                        ) : null}
                      </div>
                    ) : msg.role === "assistant" ? (
                      <div className="bubble__content markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                        {msg.status === "stopped" ? (
                          <p className="bubble__stopped">（生成をストップしました）</p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="bubble__content">{msg.text}</p>
                    )}
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
                  );
                })
              )}
            </div>

            <button
              type="button"
              className={`chat__jump ${showChatJump ? "" : "is-hidden"}`}
              onClick={() => {
                if (chatMessagesRef.current) {
                  chatMessagesRef.current.scrollTo({
                    top: chatMessagesRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }
              }}
              aria-label="scroll to latest"
            >
              ↓
            </button>
          </div>
          <form className="chat__input" onSubmit={handleSendMessage}>
            <div className="input-panel">
              <div className="input-panel__top">
                <textarea
                  placeholder="質問してみましょう"
                  rows={1}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => {
                    const isComposing =
                      event.nativeEvent.isComposing || event.isComposing || false;
                    const hasModifier =
                      event.shiftKey || event.metaKey || event.ctrlKey || event.altKey;
                    if (event.key === "Enter" && !hasModifier && !isComposing) {
                      event.preventDefault();
                      if (!chatSending) {
                        void sendMessage();
                      }
                    }
                  }}
                  ref={chatInputRef}
                />
              </div>
              <div className="input-panel__bottom">
                <div className="model-cluster">
                  <div className="model-select">
                    <button
                      type="button"
                      className={`model-option ${chatMode === "fast" ? "is-active" : ""}`}
                      onClick={() => setChatMode("fast")}
                    >
                      高速
                    </button>
                    <button
                      type="button"
                      className={`model-option ${chatMode === "standard" ? "is-active" : ""}`}
                      onClick={() => setChatMode("standard")}
                    >
                      標準
                    </button>
                    <button
                      type="button"
                      className={`model-option ${chatMode === "think" ? "is-active" : ""}`}
                      onClick={() => setChatMode("think")}
                    >
                      思考
                    </button>
                  </div>
                  <div className="usage-ring" aria-label="usage 40%">
                    <span className="usage-ring__center" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="send"
                  onClick={(event) => {
                    if (chatSending) {
                      event.preventDefault();
                      handleStopStreaming();
                    }
                  }}
                  disabled={!selectedDocumentId || !activeChatId || showThreadList}
                  aria-label={chatSending ? "stop" : "send"}
                >
                  {chatSending ? "■" : "↑"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </section>
      </div>
    </main>
  );
}
