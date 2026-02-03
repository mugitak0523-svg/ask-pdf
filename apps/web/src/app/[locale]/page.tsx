"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { PdfViewer } from "@/components/pdf-viewer/pdf-viewer";
import { supabase } from "@/lib/supabase";

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

type UsageBucket = {
  periodStart: string | null;
  periodEnd: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  pages: number;
  answerTokens: number;
  embedTokens: number;
  parsePages: number;
  answerCount: number;
  embedCount: number;
  parseCount: number;
  costYen: number | null;
  costNote?: string | null;
};

type UsageSummary = {
  current: UsageBucket;
  allTime: UsageBucket;
};

type ReferenceRequest = {
  pages: Record<number, number[]>;
};

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "askpdf.ui.v1";

const normalizeRefs = (value: unknown): ChatRef[] | undefined => {
  if (Array.isArray(value)) return value as ChatRef[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as ChatRef[]) : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export default function Home() {
  const t = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    const measure = document.createElement("span");
    measure.style.position = "fixed";
    measure.style.top = "-9999px";
    measure.style.left = "-9999px";
    measure.style.padding = "4px 8px";
    measure.style.fontSize = "11px";
    measure.style.lineHeight = "1.2";
    measure.style.letterSpacing = "0.01em";
    measure.style.whiteSpace = "nowrap";
    measure.style.fontFamily = "inherit";
    document.body.appendChild(measure);
    const handleOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        "[data-tooltip]"
      ) as HTMLElement | null;
      if (!target) return;
      const text = target.getAttribute("data-tooltip") ?? "";
      if (!text) return;
      measure.textContent = text;
      const measuredWidth = measure.getBoundingClientRect().width;
      const approxWidth = Math.min(320, Math.max(80, measuredWidth));
      const rect = target.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const left = center - approxWidth / 2;
      const right = center + approxWidth / 2;
      const padding = 8;
      let shift = 0;
      if (left < padding) {
        shift = padding - left;
      } else if (right > window.innerWidth - padding) {
        shift = window.innerWidth - padding - right;
      }
      target.style.setProperty("--tooltip-shift", `${shift}px`);
    };
    const handleOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        "[data-tooltip]"
      ) as HTMLElement | null;
      if (!target) return;
      target.style.removeProperty("--tooltip-shift");
    };
    document.addEventListener("mouseover", handleOver, true);
    document.addEventListener("mouseout", handleOut, true);
    return () => {
      document.removeEventListener("mouseover", handleOver, true);
      document.removeEventListener("mouseout", handleOut, true);
      measure.remove();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      restoreRef.current = parsed;
      if (parsed.theme === "system" || parsed.theme === "light" || parsed.theme === "dark") {
        setTheme(parsed.theme);
      }
      if (parsed.chatMode === "fast" || parsed.chatMode === "standard" || parsed.chatMode === "think") {
        setChatMode(parsed.chatMode);
      }
      if (Number.isFinite(parsed.chatWidth)) {
        setChatWidth(parsed.chatWidth);
      }
      if (typeof parsed.sidebarOpen === "boolean") {
        setSidebarOpen(parsed.sidebarOpen);
      }
      if (
        parsed.settingsSection === "general" ||
        parsed.settingsSection === "ai" ||
        parsed.settingsSection === "account" ||
        parsed.settingsSection === "messages" ||
        parsed.settingsSection === "manual"
      ) {
        setSettingsSection(parsed.settingsSection);
      }
      if (typeof parsed.showThreadList === "boolean") {
        setShowThreadList(parsed.showThreadList);
      }
    } catch {
      restoreRef.current = null;
    } finally {
      setIsHydrated(true);
    }
  }, []);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatSending, setChatSending] = useState(false);
  const chatSocketRef = useRef<WebSocket | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const refAbortRef = useRef<AbortController | null>(null);
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
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  const [referenceRequest, setReferenceRequest] = useState<ReferenceRequest | null>(null);
  const [activeRefId, setActiveRefId] = useState<string | null>(null);
  const [settingsSection, setSettingsSection] = useState<
    "general" | "ai" | "account" | "messages" | "manual"
  >("general");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const restoreRef = useRef<any | null>(null);
  const restoreDoneRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const normalizeUsageBucket = (bucket: any): UsageBucket => ({
    periodStart: bucket?.periodStart ?? null,
    periodEnd: bucket?.periodEnd ?? null,
    inputTokens: Number(bucket?.input_tokens ?? bucket?.inputTokens ?? 0),
    outputTokens: Number(bucket?.output_tokens ?? bucket?.outputTokens ?? 0),
    totalTokens: Number(bucket?.total_tokens ?? bucket?.totalTokens ?? 0),
    pages: Number(bucket?.pages ?? 0),
    answerTokens: Number(bucket?.answer_tokens ?? bucket?.answerTokens ?? 0),
    embedTokens: Number(bucket?.embed_tokens ?? bucket?.embedTokens ?? 0),
    parsePages: Number(bucket?.parse_pages ?? bucket?.parsePages ?? 0),
    answerCount: Number(bucket?.answer_count ?? bucket?.answerCount ?? 0),
    embedCount: Number(bucket?.embed_count ?? bucket?.embedCount ?? 0),
    parseCount: Number(bucket?.parse_count ?? bucket?.parseCount ?? 0),
    costYen: bucket?.costYen ?? bucket?.cost_yen ?? null,
    costNote: bucket?.costNote ?? bucket?.cost_note ?? null,
  });

  const formatNumber = (value: number) =>
    Number.isFinite(value) ? value.toLocaleString(locale) : "0";

  const SETTINGS_TAB_ID = "__settings__";

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
        setUserEmail(data.session.user?.email ?? null);
        void loadDocuments(data.session.access_token);
      } else {
        setUserEmail(null);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
      if (session) {
        setUserEmail(session.user?.email ?? null);
        void loadDocuments(session.access_token);
        if (selectedDocumentId) {
          void loadChats(selectedDocumentId, session.access_token);
        } else {
          void loadAllChats(session.access_token);
        }
      } else {
        setUserEmail(null);
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
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
      return;
    }
    root.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    setOpenDocuments((prev) =>
      prev.map((item) =>
        item.id === SETTINGS_TAB_ID ? { ...item, title: t("settingsTitle") } : item
      )
    );
    if (selectedTabId === SETTINGS_TAB_ID) {
      setSelectedDocumentTitle(t("settingsTitle"));
    }
  }, [locale, selectedTabId]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    const payload = {
      theme,
      chatMode,
      chatWidth,
      sidebarOpen,
      settingsSection,
      showThreadList,
      openDocuments,
      selectedTabId,
      selectedDocumentId,
      activeChatId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [
    isHydrated,
    theme,
    chatMode,
    chatWidth,
    sidebarOpen,
    settingsSection,
    showThreadList,
    openDocuments,
    selectedTabId,
    selectedDocumentId,
    activeChatId,
  ]);

  useEffect(() => {
    if (restoreDoneRef.current) return;
    if (!restoreRef.current) return;
    if (!isHydrated) return;
    if (!isAuthed) return;
    if (docsLoading) return;
    const restore = restoreRef.current;
    const docMap = new Map(documents.map((doc) => [doc.id, doc.title]));
    const rawOpenDocs = Array.isArray(restore.openDocuments) ? restore.openDocuments : [];
    const restoreSelectedTabId =
      typeof restore.selectedTabId === "string" ? restore.selectedTabId : null;
    const restoreSelectedDocumentId =
      typeof restore.selectedDocumentId === "string" ? restore.selectedDocumentId : null;
    const targetDocId = restoreSelectedDocumentId ?? restoreSelectedTabId;
    const wantsDocRestore = rawOpenDocs.some(
      (item: any) => item && typeof item.id === "string" && item.id !== SETTINGS_TAB_ID
    );

    // Wait for documents to load if a doc-based tab is expected.
    if ((targetDocId || wantsDocRestore) && documents.length === 0) {
      return;
    }

    const normalizedOpenDocs = rawOpenDocs
      .filter((item: any) => item && typeof item.id === "string")
      .filter((item: any) => item.id === SETTINGS_TAB_ID || docMap.has(item.id))
      .map((item: any) => {
        if (item.id === SETTINGS_TAB_ID) {
          return { id: SETTINGS_TAB_ID, title: t("settingsTitle") };
        }
        return {
          id: item.id,
          title: docMap.get(item.id) ?? String(item.title ?? t("common.untitled")),
        };
      });
    if (normalizedOpenDocs.length > 0) {
      setOpenDocuments(normalizedOpenDocs);
    }

    const restoreSettingsSection =
      restore.settingsSection === "general" ||
      restore.settingsSection === "ai" ||
      restore.settingsSection === "account" ||
      restore.settingsSection === "messages" ||
      restore.settingsSection === "manual"
        ? restore.settingsSection
        : "general";
    const restoreActiveChatId =
      typeof restore.activeChatId === "string" ? restore.activeChatId : null;

    if (restoreSelectedTabId === SETTINGS_TAB_ID) {
      setSettingsSection(restoreSettingsSection);
      handleSelectTab(SETTINGS_TAB_ID);
      restoreDoneRef.current = true;
      return;
    }

    if (targetDocId && docMap.has(targetDocId)) {
      const doc = { id: targetDocId, title: docMap.get(targetDocId) ?? t("common.untitled") };
      void handleSelectDocument(doc, {
        restoreChatId: restoreActiveChatId ?? null,
        autoOpenChat: !restoreActiveChatId,
      });
      restoreDoneRef.current = true;
      return;
    }

    restoreDoneRef.current = true;
  }, [documents, docsLoading, isAuthed, isHydrated, locale]);

  useEffect(() => {
    if (!isAuthed || settingsSection !== "account") {
      return;
    }
    let active = true;
    const loadUsage = async () => {
      setUsageLoading(true);
      setUsageError(null);
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (!accessToken) {
          throw new Error("Not authenticated");
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${baseUrl}/usage/summary`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to load usage (${response.status})`);
        }
        const payload = (await response.json()) as any;
        if (active) {
          setUsageSummary({
            current: normalizeUsageBucket(payload?.current),
            allTime: normalizeUsageBucket(payload?.allTime),
          });
        }
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : "Failed to load usage";
          setUsageError(message);
        }
      } finally {
        if (active) {
          setUsageLoading(false);
        }
      }
    };
    void loadUsage();
    return () => {
      active = false;
    };
  }, [isAuthed, settingsSection]);

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
            ? t("chat.answerFailed")
            : String(item.text ?? ""),
        status:
          item.status === "error"
            ? "error"
            : item.status === "stopped"
              ? "stopped"
              : undefined,
        refs: normalizeRefs(item.refs),
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
  ): Promise<
    { id: string; title: string | null; updatedAt: string | null; lastMessage?: string | null }[]
  > => {
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
        return [];
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
        return threads;
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
      return [];
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
          title: String(item.title ?? t("common.untitled")),
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

  const handleSelectDocument = async (
    doc: DocumentItem,
    options: { restoreChatId?: string | null; autoOpenChat?: boolean } = {}
  ) => {
    setSelectedTabId(doc.id);
    setSelectedDocumentId(doc.id);
    setSelectedDocumentTitle(doc.title);
    setOpenDocuments((prev) => {
      if (prev.some((item) => item.id === doc.id)) return prev;
      return [...prev, { id: doc.id, title: doc.title }];
    });
    setSelectedDocumentUrl(null);
    setViewerError(null);
    setViewerLoading(true);
    setReferenceRequest(null);
    setActiveRefId(null);
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
      const threads = await loadChats(doc.id, accessToken, {
        autoOpen: options.autoOpenChat ?? true,
      });
      if (options.restoreChatId) {
        const target = options.restoreChatId;
        const exists = threads.some((thread) => thread.id === target);
        if (exists) {
          setActiveChatId(target);
          setShowThreadList(false);
          await loadChatMessages(doc.id, target, accessToken);
        }
      }
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
    if (docId === SETTINGS_TAB_ID) {
      setSelectedTabId(SETTINGS_TAB_ID);
      setSelectedDocumentId(null);
      setSelectedDocumentTitle(t("settingsTitle"));
      setSelectedDocumentUrl(null);
      setViewerError(null);
      setViewerLoading(false);
      setReferenceRequest(null);
      setActiveRefId(null);
      return;
    }
    const doc = openDocuments.find((item) => item.id === docId);
    if (!doc) return;
    void handleSelectDocument({ id: doc.id, title: doc.title });
  };

  const handleCloseTab = (docId: string) => {
    setOpenDocuments((prev) => prev.filter((item) => item.id !== docId));
    if (selectedTabId === docId) {
      const remaining = openDocuments.filter((item) => item.id !== docId);
      if (remaining.length > 0) {
        const nextDoc = remaining[remaining.length - 1];
        void handleSelectDocument(nextDoc);
      } else {
        setSelectedTabId(null);
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

  const handleOpenSettings = () => {
    setOpenDocuments((prev) => {
      if (prev.some((item) => item.id === SETTINGS_TAB_ID)) return prev;
      return [...prev, { id: SETTINGS_TAB_ID, title: t("settingsTitle") }];
    });
    setSettingsSection("general");
    handleSelectTab(SETTINGS_TAB_ID);
  };

  const openSettingsSection = (section: string) => {
    setOpenDocuments((prev) => {
      if (prev.some((item) => item.id === SETTINGS_TAB_ID)) return prev;
      return [...prev, { id: SETTINGS_TAB_ID, title: t("settingsTitle") }];
    });
    setSettingsSection(section);
    handleSelectTab(SETTINGS_TAB_ID);
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

  const handleRefClick = async (refId: string) => {
    if (!selectedDocumentId) return;
    if (activeRefId === refId) {
      setReferenceRequest(null);
      setActiveRefId(null);
      return;
    }
    const chunkId = refId.startsWith("chunk-") ? refId.slice(6) : refId;
    if (!chunkId) return;
    try {
      setActiveRefId(refId);
      setReferenceRequest(null);
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        setActiveRefId(null);
        return;
      }
      refAbortRef.current?.abort();
      const controller = new AbortController();
      refAbortRef.current = controller;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${selectedDocumentId}/chunks/${chunkId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        setActiveRefId(null);
        return;
      }
      const payload = await response.json();
      const rawMetadata = payload?.chunk?.metadata;
      const metadata =
        typeof rawMetadata === "string"
          ? (() => {
              try {
                return JSON.parse(rawMetadata);
              } catch {
                return null;
              }
            })()
          : rawMetadata;
      if (!metadata || typeof metadata !== "object") {
        setActiveRefId(null);
        return;
      }
      const pages = (metadata as Record<string, unknown>).page
        ?? (metadata as Record<string, unknown>).pages
        ?? (metadata as Record<string, unknown>).page_number;
      const wordIndexes =
        (metadata as Record<string, unknown>).word_indexes
        ?? (metadata as Record<string, unknown>).wordIndexes;
      if (!Array.isArray(wordIndexes) || wordIndexes.length === 0) {
        setActiveRefId(null);
        return;
      }
      const pageList: number[] = Array.isArray(pages)
        ? pages.filter((value: unknown) => Number.isFinite(Number(value))).map(Number)
        : Number.isFinite(Number(pages))
          ? [Number(pages)]
          : [];
      if (pageList.length === 0) {
        setActiveRefId(null);
        return;
      }
      const requestPages: Record<number, number[]> = {};
      for (const pageNumber of pageList) {
        requestPages[pageNumber] = wordIndexes
          .filter((value: unknown) => Number.isFinite(Number(value)))
          .map(Number);
      }
      setReferenceRequest({ pages: requestPages });
    } catch {
      setActiveRefId(null);
      return;
    } finally {
      refAbortRef.current = null;
    }
  };

  const activeChatTitle = selectedDocumentId
    ? showThreadList
      ? t("chat.documentChatList")
      : chatThreads.find((thread) => thread.id === activeChatId)?.title ??
        (activeChatId ? t("chat.newChat") : t("chat.chat"))
    : t("chat.allChatList");

  const formatRelativeTime = (value: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
    if (diffMinutes < 1) return t("time.now");
    if (diffMinutes < 60) {
      const rounded = Math.max(1, Math.round(diffMinutes / 5) * 5);
      return t("time.minutesAgo", { count: rounded });
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      const rounded = Math.max(1, Math.round(diffHours));
      return t("time.hoursAgo", { count: rounded });
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      const rounded = Math.max(1, Math.round(diffDays));
      return t("time.daysAgo", { count: rounded });
    }
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      const rounded = Math.max(1, Math.round(diffMonths));
      return t("time.monthsAgo", { count: rounded });
    }
    const diffYears = Math.floor(diffMonths / 12);
    return t("time.yearsAgo", { count: Math.max(1, diffYears) });
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
                  ? t("chat.answerFailed")
                  : String(saved.text ?? "");
              setChatMessages((prev) =>
                prev.map((item) =>
                  item.id === pendingId
                    ? {
                        id: String(saved.id),
                        role: "assistant",
                        text,
                        status,
                        refs: normalizeRefs(saved.refs),
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
                      text: t("chat.answerFailed"),
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
                text: t("chat.answerFailed"),
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


  const renderSettingsDetail = () => {
    if (settingsSection === "general") {
      return (
        <>
          <h2 className="settings__title">{t("general")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("startScreen")}</div>
                <div className="settings__item-desc">{t("startScreenDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("settings.restore")}</option>
                <option>{t("settings.resetEveryTime")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("language")}</div>
                <div className="settings__item-desc">{t("languageDesc")}</div>
              </div>
              <select
                className="settings__select"
                value={locale}
                onChange={(event) => {
                  const value = event.target.value;
                  if (
                    value === "ja" ||
                    value === "en" ||
                    value === "es" ||
                    value === "fr" ||
                    value === "de" ||
                    value === "ko" ||
                    value === "zh"
                  ) {
                    router.replace(pathname, { locale: value });
                  }
                }}
              >
                <option value="ja">{t("languageJa")}</option>
                <option value="en">{t("languageEn")}</option>
                <option value="es">{t("languageEs")}</option>
                <option value="fr">{t("languageFr")}</option>
                <option value="de">{t("languageDe")}</option>
                <option value="ko">{t("languageKo")}</option>
                <option value="zh">{t("languageZh")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("theme")}</div>
                <div className="settings__item-desc">{t("themeDesc")}</div>
              </div>
              <select
                className="settings__select"
                value={theme}
                onChange={(event) => {
                  const value = event.target.value as ThemeMode;
                  setTheme(value === "light" || value === "dark" ? value : "system");
                }}
              >
                <option value="light">{t("themeLight")}</option>
                <option value="dark">{t("themeDark")}</option>
                <option value="system">{t("themeSystem")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("timeFormat")}</div>
                <div className="settings__item-desc">{t("timeFormatDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("time24h")}</option>
                <option>{t("time12h")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("notifications")}</div>
                <div className="settings__item-desc">{t("notificationsDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("settingsOpen")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "ai") {
      return (
        <>
          <h2 className="settings__title">{t("ai")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("defaultModel")}</div>
                <div className="settings__item-desc">{t("defaultModelDesc")}</div>
              </div>
              <select
                className="settings__select"
                value={chatMode}
                onChange={(event) => {
                  const value = event.target.value as "fast" | "standard" | "think";
                  setChatMode(value);
                }}
              >
                <option value="fast">fast</option>
                <option value="standard">standard</option>
                <option value="think">think</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("ragSettings")}</div>
                <div className="settings__item-desc">{t("ragSettingsDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("longAnswer")}</div>
                <div className="settings__item-desc">{t("longAnswerDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("answerLength.standard")}</option>
                <option>{t("answerLength.short")}</option>
                <option>{t("answerLength.veryShort")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("answerStyle")}</div>
                <div className="settings__item-desc">{t("answerStyleDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("answerStyleOption.standard")}</option>
                <option>{t("answerStyleOption.short")}</option>
                <option>{t("answerStyleOption.polite")}</option>
                <option>{t("answerStyleOption.bullets")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("safetyMode")}</div>
                <div className="settings__item-desc">{t("safetyModeDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("settingsOpen")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "account") {
      const currentUsage = usageSummary?.current;
      const usageValue = usageLoading
        ? t("common.loading")
        : usageError
          ? t("common.fetchFailed")
          : currentUsage
            ? t("usage.summary", {
                tokens: formatNumber(currentUsage.totalTokens),
                pages: formatNumber(currentUsage.pages),
              })
            : t("common.noData");
      const usageCost = usageLoading
        ? t("common.loading")
        : usageError
          ? t("common.fetchFailed")
          : currentUsage
            ? currentUsage.costYen === null
              ? currentUsage.costNote ?? t("common.unset")
              : t("common.yen", { value: formatNumber(currentUsage.costYen) })
            : t("common.noData");
      return (
        <>
          <h2 className="settings__title">{t("account")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("email")}</div>
                <div className="settings__item-desc">{t("emailDesc")}</div>
              </div>
              <div className="settings__value">
                {userEmail ?? t("auth.notSignedIn")}
              </div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("username")}</div>
                <div className="settings__item-desc">{t("usernameDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("change")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("plan")}</div>
                <div className="settings__item-desc">{t("planDesc")}</div>
              </div>
              <div className="settings__value">
                {t("planFree")}
              </div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("usageThisMonth")}</div>
                <div className="settings__item-desc">{t("usageThisMonthDesc")}</div>
              </div>
              <div className="settings__value">{usageValue}</div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("usageCost")}</div>
                <div className="settings__item-desc">{t("usageCostDesc")}</div>
              </div>
              <div className="settings__value">{usageCost}</div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("billing")}</div>
                <div className="settings__item-desc">{t("billingDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("manage")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("signOut")}</div>
                <div className="settings__item-desc">{t("signOutDesc")}</div>
              </div>
              <button type="button" className="settings__btn" onClick={handleSignOut}>
                {t("signOut")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "messages") {
      return (
        <>
          <h2 className="settings__title">{t("messages.title")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.refsTitle")}</div>
                <div className="settings__item-desc">{t("messages.refsDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("settingsOpen")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.soundTitle")}</div>
                <div className="settings__item-desc">{t("messages.soundDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("common.on")}</option>
                <option>{t("common.off")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.readReceiptTitle")}</div>
                <div className="settings__item-desc">{t("messages.readReceiptDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("settingsOpen")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.clearHistoryTitle")}</div>
                <div className="settings__item-desc">{t("messages.clearHistoryDesc")}</div>
              </div>
              <button type="button" className="settings__btn settings__btn--danger">
                {t("common.delete")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.exportTitle")}</div>
                <div className="settings__item-desc">{t("messages.exportDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("messages.exportAction")}
              </button>
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <h2 className="settings__title">{t("manual.title")}</h2>
        <div className="settings__group">
          <div className="settings__item">
            <div>
              <div className="settings__item-title">{t("manual.basicsTitle")}</div>
              <div className="settings__item-desc">
                {t("manual.basicsDesc")}
              </div>
            </div>
            <button type="button" className="settings__btn">{t("open")}</button>
          </div>
          <div className="settings__item">
            <div>
              <div className="settings__item-title">{t("manual.shortcutsTitle")}</div>
              <div className="settings__item-desc">{t("manual.shortcutsDesc")}</div>
            </div>
            <button type="button" className="settings__btn">{t("open")}</button>
          </div>
          <div className="settings__item">
            <div>
              <div className="settings__item-title">FAQ</div>
              <div className="settings__item-desc">
                {t("manual.faqDesc")}
              </div>
            </div>
            <button type="button" className="settings__btn">{t("open")}</button>
          </div>
        </div>
      </>
    );
  };

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
    const title = t("chat.newChatNumber", { count: nextIndex });
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
            <span className="label">
              {sidebarOpen ? t("sidebar.collapse") : t("sidebar.expand")}
            </span>
          </button>
          <button
            type="button"
            className={`history-item sidebar-upload ${uploading ? "is-uploading" : ""}`}
            onClick={handleUploadClick}
            disabled={!isAuthed || uploading}
          >
            {uploading ? (
              <>
                <span className="spinner" aria-label={t("aria.uploading")} />
                <span className="label">{t("sidebar.uploading")}</span>
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
                <span className="label">{sidebarOpen ? t("sidebar.upload") : ""}</span>
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
            <span className="label">{t("sidebar.search")}</span>
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
            <span className="label">{t("sidebar.switch")}</span>
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
              <p className="auth-hint">{renderLoadingText(t("common.loading"))}</p>
            ) : docsError ? (
              <div className="auth-hint">
                <p>{t("common.errorOccurred")}</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="auth-hint">
                <p>{t("sidebar.noDocuments")}</p>
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
              <p>{t("sidebar.signInHint")}</p>
              <Link className="ghost auth-link" href="/login">
                {t("auth.signInLink")}
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
              <span className="label">{t("auth.signOut")}</span>
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
              <span className="label">{t("viewer.noDocument")}</span>
            )}
          </div>
        </div>
        <div className="viewer__actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={t("tooltip.settings")}
            onClick={handleOpenSettings}
            data-tooltip={t("tooltip.settings")}
          >
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
          <button
            type="button"
            className="icon-btn"
            aria-label={t("tooltip.messages")}
            onClick={() => openSettingsSection("messages")}
            data-tooltip={t("tooltip.messages")}
          >
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
          <button
            type="button"
            className="icon-btn"
            aria-label={t("tooltip.account")}
            onClick={() => openSettingsSection("account")}
            data-tooltip={t("tooltip.account")}
          >
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
                {t("auth.signIn")}
              </Link>
              <Link className="primary" href="/signup">
                {t("auth.signUp")}
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
              aria-label={t("aria.scrollLeft")}
            >
              ≪
            </button>
            <div className="viewer__tabs" ref={tabsRef}>
              {openDocuments.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  className={`viewer__tab ${
                    doc.id === selectedTabId ? "viewer__tab--active" : ""
                  }`}
                  onClick={() => handleSelectTab(doc.id)}
                >
                  <span className="viewer__tab-label">{doc.title}</span>
                  <span
                    className="viewer__tab-close"
                    role="button"
                    aria-label={t("aria.close")}
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
              aria-label={t("aria.scrollRight")}
            >
              ≫
            </button>
          </div>
          <div className="viewer__canvas">
            {viewerLoading ? (
              <div className="empty-state">{renderLoadingText(t("common.loading"))}</div>
            ) : selectedTabId === SETTINGS_TAB_ID ? (
              <div className="settings">
                <aside className="settings__nav">
                  <div className="settings__profile">
                    <div className="settings__avatar">
                      {(userEmail?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div>
                      <div className="settings__email">
                        {userEmail ?? t("auth.notSignedIn")}
                      </div>
                      <div className="settings__plan">{t("planFree")}</div>
                    </div>
                  </div>
                  <div className="settings__nav-group">
                    {[
                      { id: "general", label: t("general") },
                      { id: "ai", label: t("ai") },
                      { id: "account", label: t("account") },
                      { id: "messages", label: t("messages.title") },
                      { id: "manual", label: t("manual.title") },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`settings__nav-item ${
                          settingsSection === item.id ? "is-active" : ""
                        }`}
                        onClick={() =>
                          setSettingsSection(
                            item.id as "general" | "ai" | "account" | "messages" | "manual"
                          )
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </aside>
                <div className="settings__detail">{renderSettingsDetail()}</div>
              </div>
            ) : viewerError ? (
              <div className="empty-state">{t("common.errorOccurred")}</div>
            ) : selectedDocumentUrl ? (
              <PdfViewer
                url={selectedDocumentUrl}
                documentId={selectedDocumentId}
                accessToken={selectedDocumentToken}
                referenceRequest={referenceRequest}
                onClearReferenceRequest={() => {
                  setReferenceRequest(null);
                  setActiveRefId(null);
                }}
                onAddToChat={(text) => {
                  setChatInput((prev) => {
                    const prefix = prev.trim().length > 0 ? "\n" : "";
                    return `${prev}${prefix}"${text}"`;
                  });
                }}
              />
            ) : (
              <div className="empty-state">{t("viewer.empty")}</div>
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
                    aria-label={t("aria.back")}
                    onClick={async () => {
                      setShowThreadList(true);
                      const session = await supabase.auth.getSession();
                      const accessToken = session.data.session?.access_token;
                      if (accessToken && selectedDocumentId) {
                        await loadChats(selectedDocumentId, accessToken, { autoOpen: false });
                      }
                    }}
                    data-tooltip={t("tooltip.chatHistory")}
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
                    aria-label={t("aria.newChat")}
                    onClick={handleCreateChat}
                    data-tooltip={t("tooltip.newChat")}
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
                    aria-label={t("tooltip.aiSettings")}
                    onClick={() => openSettingsSection("ai")}
                    data-tooltip={t("tooltip.aiSettings")}
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
                      aria-label={t("tooltip.chatHistory")}
                      onClick={async () => {
                        setShowThreadList(true);
                        const session = await supabase.auth.getSession();
                        const accessToken = session.data.session?.access_token;
                        if (accessToken && selectedDocumentId) {
                          await loadChats(selectedDocumentId, accessToken, { autoOpen: false });
                        }
                      }}
                      data-tooltip={t("tooltip.chatHistory")}
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
                  aria-label={t("tooltip.aiSettings")}
                  onClick={() => openSettingsSection("ai")}
                  data-tooltip={t("tooltip.aiSettings")}
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
                <div className="empty-state">{renderLoadingText(t("common.loading"))}</div>
              ) : chatError ? (
                <div className="empty-state">{t("common.errorOccurred")}</div>
              ) : !selectedDocumentId ? (
                allChatThreads.length === 0 ? (
                  <div className="empty-state">{t("chat.noChats")}</div>
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
                            title: thread.documentTitle ?? t("common.untitled"),
                          })
                        }
                      >
                        <div className="chat__thread-row">
                          <div className="chat__thread-title">
                            {thread.title ?? t("chat.newChat")}
                          </div>
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                        </div>
                        <div className="chat__thread-meta">
                          {thread.documentTitle ?? t("common.untitled")}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : showThreadList ? (
                chatThreads.length === 0 ? (
                  <div className="empty-state">{t("chat.noDocumentChats")}</div>
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
                            {thread.title ?? t("chat.newChat")}
                          </div>
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                        </div>
                        <div className="chat__thread-meta">
                          {thread.lastMessage ?? t("chat.noMessages")}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : chatMessages.length === 0 ? (
                <div className="empty-state">
                  {selectedDocumentId ? t("chat.noChats") : t("viewer.selectPdf")}
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
                        <p>{renderLoadingText(t("chat.answering"))}</p>
                      )
                    ) : msg.status === "error" || msg.status === "stopped" ? (
                      <div className="bubble__row">
                        <p className="bubble__content">{msg.text}</p>
                        {msg.status === "stopped" ? (
                          <p className="bubble__stopped">{t("chat.stopped")}</p>
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
                            aria-label={t("aria.retry")}
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
                          <p className="bubble__stopped">{t("chat.stopped")}</p>
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
                            onClick={() => handleRefClick(ref.id)}
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
              aria-label={t("aria.scrollToLatest")}
            >
              ↓
            </button>
          </div>
          <form className="chat__input" onSubmit={handleSendMessage}>
            <div className="input-panel">
              <div className="input-panel__top">
                <textarea
                  placeholder={t("chat.placeholder")}
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
                      {t("model.fast")}
                    </button>
                    <button
                      type="button"
                      className={`model-option ${chatMode === "standard" ? "is-active" : ""}`}
                      onClick={() => setChatMode("standard")}
                    >
                      {t("model.standard")}
                    </button>
                    <button
                      type="button"
                      className={`model-option ${chatMode === "think" ? "is-active" : ""}`}
                      onClick={() => setChatMode("think")}
                    >
                      {t("model.think")}
                    </button>
                  </div>
                  <div className="usage-ring" aria-label={t("aria.usageRing", { percent: 40 })}>
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
                  disabled={
                    !selectedDocumentId || !activeChatId || showThreadList || chatLoading
                  }
                  aria-label={chatSending ? t("chat.stop") : t("chat.send")}
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
