"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { PdfViewer } from "@/components/pdf-viewer/pdf-viewer";
import { supabase } from "@/lib/supabase";

type ChatRef = {
  label: string;
  id: string;
  documentId?: string;
  aboveThreshold?: boolean;
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
type PlanName = "guest" | "free" | "plus" | "pro";

type PlanLimits = {
  maxFiles: number | null;
  maxFileMb: number | null;
  maxMessagesPerThread: number | null;
  maxThreadsPerDocument: number | null;
};

type ClientChunk = {
  id: string;
  documentId: string;
  content: string;
  metadata: any;
  embedding: Float32Array;
  norm: number;
};

type ChunkCache = {
  loadedAt: number;
  chunks: ClientChunk[];
};

const DEFAULT_PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  guest: { maxFiles: 3, maxFileMb: 10, maxMessagesPerThread: 10, maxThreadsPerDocument: null },
  free: { maxFiles: 10, maxFileMb: 20, maxMessagesPerThread: 20, maxThreadsPerDocument: null },
  plus: { maxFiles: 50, maxFileMb: 30, maxMessagesPerThread: 50, maxThreadsPerDocument: 5 },
  pro: { maxFiles: null, maxFileMb: 50, maxMessagesPerThread: null, maxThreadsPerDocument: null },
};

const STORAGE_KEY = "askpdf.ui.v1";
const DOCUMENTS_SEEN_KEY = "askpdf.docs.seen.v1";
const CLIENT_MATCH_MAX = 20;
const RAG_SEARCH_MODE = (process.env.NEXT_PUBLIC_RAG_SEARCH_MODE ?? "client").toLowerCase();
const USE_CLIENT_RAG = RAG_SEARCH_MODE === "client";

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

const replaceRefTags = (text: string, refs?: ChatRef[]) => {
  if (!text) return text;
  if (!refs || refs.length === 0) {
    return text.replace(/\[@:chunk-[^\]]+\]/gi, "");
  }
  const lookup = new Map<string, ChatRef>();
  for (const ref of refs) {
    if (ref.aboveThreshold === false) continue;
    if (ref.id && !lookup.has(ref.id)) lookup.set(ref.id, ref);
  }
  return text.replace(/\[@:chunk-([^\]]+)\]/gi, (_, rawId) => {
    const trimmed = String(rawId).trim();
    const key = `chunk-${trimmed}`;
    let ref = lookup.get(key);
    if (!ref && /^\d+$/.test(trimmed)) {
      const visibleRefs = refs.filter((item) => item.aboveThreshold !== false);
      const index = Number(trimmed) - 1;
      if (index >= 0 && index < visibleRefs.length) ref = visibleRefs[index];
    }
    if (!ref) return "";
    return normalizeRefLabel(ref.label, ref.id);
  });
};

const buildRefLinkedText = (text: string, refs?: ChatRef[]) => {
  if (!text) return text;
  if (!refs || refs.length === 0) {
    return text.replace(/\[@:chunk-[^\]]+\]/gi, "");
  }
  const lookup = new Map<string, ChatRef>();
  for (const ref of refs) {
    if (ref.aboveThreshold === false) continue;
    if (ref.id && !lookup.has(ref.id)) lookup.set(ref.id, ref);
  }
  return text.replace(/\[@:chunk-([^\]]+)\]/gi, (_, rawId) => {
    const trimmed = String(rawId).trim();
    const key = `chunk-${trimmed}`;
    let ref = lookup.get(key);
    if (!ref && /^\d+$/.test(trimmed)) {
      const visibleRefs = refs.filter((item) => item.aboveThreshold !== false);
      const index = Number(trimmed) - 1;
      if (index >= 0 && index < visibleRefs.length) ref = visibleRefs[index];
    }
    if (!ref) return "";
    const label = normalizeRefLabel(ref.label, ref.id);
    const doc = ref.documentId ? `?doc=${ref.documentId}` : "";
    return `[${label}](ref:${ref.id}${doc})`;
  });
};

const parseRefHref = (href?: string | null) => {
  if (!href || !href.startsWith("ref:")) return null;
  const raw = href.slice(4);
  const [refId, query] = raw.split("?");
  if (!refId) return null;
  const params = new URLSearchParams(query || "");
  const documentId = params.get("doc") ?? undefined;
  return { refId, documentId };
};

const normalizeRefLabel = (label?: string, fallback?: string) =>
  (label ?? fallback ?? "").replace(/\s*#\d+$/, "");

const isRefVisible = (ref: ChatRef) => ref.aboveThreshold !== false;

const buildRefLabelLookup = (refs?: ChatRef[]) => {
  if (!refs || refs.length === 0) return new Map<string, ChatRef>();
  const lookup = new Map<string, ChatRef>();
  for (const ref of refs) {
    if (!isRefVisible(ref)) continue;
    const label = normalizeRefLabel(ref.label, ref.id);
    if (!label) continue;
    if (!lookup.has(label)) lookup.set(label, ref);
  }
  return lookup;
};

const buildRefIdLookup = (refs?: ChatRef[]) => {
  if (!refs || refs.length === 0) return new Map<string, ChatRef>();
  const lookup = new Map<string, ChatRef>();
  for (const ref of refs) {
    if (!isRefVisible(ref)) continue;
    if (ref.id && !lookup.has(ref.id)) lookup.set(ref.id, ref);
  }
  return lookup;
};

const getNodeText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) return getNodeText(node.props.children);
  return "";
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
  const [chatOpen, setChatOpen] = useState(true);
  const [sidebarListCollapsed, setSidebarListCollapsed] = useState(false);
  const [sidebarSettingsCollapsed, setSidebarSettingsCollapsed] = useState(true);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const [showChatJump, setShowChatJump] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [refPreviewMap, setRefPreviewMap] = useState<
    Record<string, { text: string; metadata?: Record<string, unknown>; documentTitle?: string }>
  >({});
  const refPreviewInFlight = useRef<Set<string>>(new Set());
  const [refTooltip, setRefTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    pageLabel: string | null;
    text: string;
    anchor: DOMRect | null;
    refId: string | null;
    documentId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    pageLabel: null,
    text: "",
    anchor: null,
    refId: null,
    documentId: null,
  });
  const refTooltipBodyRef = useRef<HTMLDivElement | null>(null);
  const [tooltipContainer, setTooltipContainer] = useState<HTMLElement | null>(null);

  const getRefPreviewKey = (refId: string, documentId?: string) =>
    `${refId}::${documentId ?? ""}`;

  const getChunkIdFromRef = (refId: string) =>
    refId.startsWith("chunk-") ? refId.slice("chunk-".length) : refId;

  const getRefPreviewTitle = (refId: string, documentId: string | undefined, fallback: string) => {
    const key = getRefPreviewKey(refId, documentId);
    return refPreviewMap[key]?.text ?? fallback;
  };

  const getRefPreviewData = (refId: string, documentId?: string) => {
    const key = getRefPreviewKey(refId, documentId);
    return refPreviewMap[key];
  };

  const getRefPageLabel = (metadata?: Record<string, unknown>) => {
    if (!metadata) return null;
    const raw =
      metadata.page ?? metadata.pages ?? metadata.page_number ?? metadata.pageNumber ?? null;
    if (Array.isArray(raw)) {
      const values = raw.filter((item) => Number.isFinite(item)).map((item) => String(item));
      return values.length ? `p ${values.join(", ")}` : null;
    }
    if (Number.isFinite(raw)) return `p ${raw}`;
    return null;
  };

  const getRefPageLabelFromLabel = (label: string | undefined) => {
    if (!label) return null;
    const match = label.match(/p\.?\s*([\d,\s]+)/i);
    if (match?.[1]) {
      const cleaned = match[1].replace(/\s+/g, " ").trim();
      return cleaned ? `p ${cleaned}` : null;
    }
    if (/^\d+(,\s*\d+)*$/.test(label.trim())) {
      return `p ${label.trim()}`;
    }
    return null;
  };

  const REF_TOOLTIP_WIDTH = 360;
  const REF_TOOLTIP_HEIGHT = 220;
  const REF_TOOLTIP_PADDING = 8;

  const computeRefTooltipPosition = (rect: DOMRect) => {
    const gap = 2;
    const padding = REF_TOOLTIP_PADDING;
    let x = rect.left;
    let y = rect.bottom + gap;
    const maxX = window.innerWidth - padding - REF_TOOLTIP_WIDTH;
    const maxY = window.innerHeight - padding - REF_TOOLTIP_HEIGHT;
    if (x > maxX) x = maxX;
    if (x < padding) x = padding;
    if (y > maxY) {
      y = rect.top - REF_TOOLTIP_HEIGHT - gap;
    }
    if (y < padding) y = padding;
    return { x, y };
  };

  const showRefTooltip = (
    event: React.MouseEvent<HTMLElement>,
    refId: string,
    documentId: string | undefined,
    fallbackTitle: string
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = computeRefTooltipPosition(rect);
    const preview = getRefPreviewData(refId, documentId);
    const title = preview?.documentTitle || fallbackTitle;
    const pageLabel = getRefPageLabel(preview?.metadata) ?? getRefPageLabelFromLabel(fallbackTitle);
    const text = preview?.text || "Loading...";
    setRefTooltip({
      visible: true,
      x,
      y,
      title,
      pageLabel,
      text,
      anchor: rect,
      refId,
      documentId: documentId ?? null,
    });
    requestAnimationFrame(() => {
      if (refTooltipBodyRef.current) {
        refTooltipBodyRef.current.scrollTop = 0;
      }
    });
  };

  const moveRefTooltip = (event: React.MouseEvent<HTMLElement>) => {
    if (!refTooltip.visible) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = computeRefTooltipPosition(rect);
    setRefTooltip((prev) => ({ ...prev, x, y, anchor: rect }));
  };

  const hideRefTooltip = () => {
    setRefTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleRefButtonLeave = (event: React.MouseEvent<HTMLElement>) => {
    const next = event.relatedTarget as HTMLElement | null;
    if (next?.closest?.(".ref-tooltip")) return;
    hideRefTooltip();
  };

  useEffect(() => {
    const handleGlobalPointer = (event: MouseEvent) => {
      if (!refTooltip.visible) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest?.(".ref-tooltip")) return;
      if (target.closest?.(".ref")) return;
      hideRefTooltip();
    };
    window.addEventListener("mousemove", handleGlobalPointer, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleGlobalPointer);
    };
  }, [refTooltip.visible]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setTooltipContainer(document.body);
  }, []);

  const ensureRefPreview = async (refId: string, documentId?: string) => {
    const key = getRefPreviewKey(refId, documentId);
    if (refPreviewMap[key] || refPreviewInFlight.current.has(key)) return;
    refPreviewInFlight.current.add(key);
    try {
      const accessToken =
        (await supabase.auth.getSession()).data.session?.access_token ?? "";
      if (!accessToken) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const chunkId = getChunkIdFromRef(refId);
      const url = new URL(`${baseUrl}/document-chunks/${chunkId}`);
      if (documentId) url.searchParams.set("document_id", documentId);
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      const text = typeof data?.chunk?.text === "string" ? data.chunk.text : "";
      if (!text) return;
      const metadata =
        data?.chunk?.metadata && typeof data.chunk.metadata === "object"
          ? data.chunk.metadata
          : undefined;
      const documentTitle =
        typeof data?.chunk?.documentTitle === "string" ? data.chunk.documentTitle : undefined;
      setRefPreviewMap((prev) => ({
        ...prev,
        [key]: { text, metadata, documentTitle },
      }));
    } finally {
      refPreviewInFlight.current.delete(key);
    }
  };

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
    let portal: HTMLDivElement | null = null;
    const ensurePortal = () => {
      if (portal) return portal;
      const node = document.createElement("div");
      node.className = "app-tooltip";
      node.style.position = "fixed";
      node.style.top = "0";
      node.style.left = "0";
      node.style.transform = "translate(-9999px, -9999px)";
      node.style.pointerEvents = "none";
      node.style.zIndex = "9999";
      document.body.appendChild(node);
      portal = node;
      return node;
    };

    const hidePortal = () => {
      if (!portal) return;
      portal.style.opacity = "0";
      portal.style.transform = "translate(-9999px, -9999px)";
    };

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
      const clampedLeft = Math.max(padding, Math.min(window.innerWidth - padding, center + shift));
      const usePortal = target.getAttribute("data-tooltip-portal") === "true";
      const position = target.getAttribute("data-tooltip-position") ?? "bottom";
      if (usePortal) {
        const node = ensurePortal();
        node.textContent = text;
        node.style.opacity = "1";
        node.style.transform = "translate(-9999px, -9999px)";
        const width = node.getBoundingClientRect().width;
        const height = node.getBoundingClientRect().height;
        const leftPos = Math.max(padding, Math.min(window.innerWidth - padding, clampedLeft));
        const topPos = position === "top" ? rect.top - height - 8 : rect.bottom + 8;
        node.style.transform = `translate(${leftPos - width / 2}px, ${topPos}px)`;
      } else {
        target.style.setProperty("--tooltip-shift", `${shift}px`);
        target.style.setProperty("--tooltip-left", `${clampedLeft}px`);
        target.style.setProperty("--tooltip-top", `${rect.bottom + 8}px`);
      }
    };
    const handleMove = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        "[data-tooltip]"
      ) as HTMLElement | null;
      if (!target) return;
      if (!target.getAttribute("data-tooltip")) return;
      const rect = target.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const measuredWidth = measure.getBoundingClientRect().width;
      const approxWidth = Math.min(320, Math.max(80, measuredWidth));
      const left = center - approxWidth / 2;
      const right = center + approxWidth / 2;
      const padding = 8;
      let shift = 0;
      if (left < padding) {
        shift = padding - left;
      } else if (right > window.innerWidth - padding) {
        shift = window.innerWidth - padding - right;
      }
      const clampedLeft = Math.max(padding, Math.min(window.innerWidth - padding, center + shift));
      const usePortal = target.getAttribute("data-tooltip-portal") === "true";
      const position = target.getAttribute("data-tooltip-position") ?? "bottom";
      if (usePortal) {
        const node = ensurePortal();
        node.textContent = target.getAttribute("data-tooltip") ?? "";
        node.style.opacity = "1";
        const width = node.getBoundingClientRect().width;
        const height = node.getBoundingClientRect().height;
        const leftPos = Math.max(padding, Math.min(window.innerWidth - padding, clampedLeft));
        const topPos = position === "top" ? rect.top - height - 8 : rect.bottom + 8;
        node.style.transform = `translate(${leftPos - width / 2}px, ${topPos}px)`;
      } else {
        target.style.setProperty("--tooltip-shift", `${shift}px`);
        target.style.setProperty("--tooltip-left", `${clampedLeft}px`);
        target.style.setProperty("--tooltip-top", `${rect.bottom + 8}px`);
      }
    };
    const handleOut = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest?.(
        "[data-tooltip]"
      ) as HTMLElement | null;
      if (!target) return;
      const usePortal = target.getAttribute("data-tooltip-portal") === "true";
      if (usePortal) {
        hidePortal();
      } else {
        target.style.removeProperty("--tooltip-shift");
        target.style.removeProperty("--tooltip-left");
        target.style.removeProperty("--tooltip-top");
      }
    };
    document.addEventListener("mouseover", handleOver, true);
    document.addEventListener("mousemove", handleMove, true);
    document.addEventListener("mouseout", handleOut, true);
    return () => {
      document.removeEventListener("mouseover", handleOver, true);
      document.removeEventListener("mousemove", handleMove, true);
      document.removeEventListener("mouseout", handleOut, true);
      measure.remove();
      if (portal) {
        portal.remove();
        portal = null;
      }
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
      if (typeof parsed.chatOpen === "boolean") {
        setChatOpen(parsed.chatOpen);
      }
      if (typeof parsed.sidebarOpen === "boolean") {
        setSidebarOpen(parsed.sidebarOpen);
      }
      if (typeof parsed.sidebarListCollapsed === "boolean") {
        setSidebarListCollapsed(parsed.sidebarListCollapsed);
      }
      if (typeof parsed.sidebarSettingsCollapsed === "boolean") {
        setSidebarSettingsCollapsed(parsed.sidebarSettingsCollapsed);
      }
      if (
        parsed.settingsSection === "general" ||
        parsed.settingsSection === "ai" ||
        parsed.settingsSection === "account" ||
        parsed.settingsSection === "usage" ||
        parsed.settingsSection === "messages" ||
        parsed.settingsSection === "manual" ||
        parsed.settingsSection === "service" ||
        parsed.settingsSection === "faq"
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
  const seenDocsCacheRef = useRef(false);
  const documentChunkCacheRef = useRef<Map<string, ChunkCache>>(new Map());
  const documentChunkLoadRef = useRef<Map<string, Promise<ChunkCache | null>>>(new Map());

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
  const [editingChatTitle, setEditingChatTitle] = useState(false);
  const [chatTitleDraft, setChatTitleDraft] = useState("");
  const [openChatMenuId, setOpenChatMenuId] = useState<string | null>(null);
  const [pendingRenameChatId, setPendingRenameChatId] = useState<string | null>(null);
  const [editingChatListId, setEditingChatListId] = useState<string | null>(null);
  const [chatListTitleDraft, setChatListTitleDraft] = useState("");
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
  const [seenDocumentIds, setSeenDocumentIds] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [selectedDocumentTitle, setSelectedDocumentTitle] = useState<string | null>(null);
  const [selectedDocumentResult, setSelectedDocumentResult] = useState<any | null>(null);
  const [selectedDocumentAnnotations, setSelectedDocumentAnnotations] = useState<
    Record<number, Record<number, any[]>> | null
  >(null);
  const bundleCacheRef = useRef<
    Map<
      string,
      {
        signedUrl: string;
        expiresAt: number;
        result: any | null;
        annotations: Record<number, Record<number, any[]>>;
      }
    >
  >(new Map());
  const [selectedDocumentToken, setSelectedDocumentToken] = useState<string | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [openDocuments, setOpenDocuments] = useState<OpenDocument[]>([]);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);
  const [tabsOverflow, setTabsOverflow] = useState(false);
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(null);
  const [documentTitleDraft, setDocumentTitleDraft] = useState("");
  const [openDocMenuId, setOpenDocMenuId] = useState<string | null>(null);
  const [referenceRequest, setReferenceRequest] = useState<ReferenceRequest | null>(null);
  const [activeRefId, setActiveRefId] = useState<string | null>(null);
  const [settingsSection, setSettingsSection] = useState<
    "general" | "ai" | "account" | "usage" | "messages" | "manual" | "service" | "faq"
  >("general");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [plan, setPlan] = useState<PlanName>("guest");
  const [planLimits, setPlanLimits] = useState<PlanLimits>(DEFAULT_PLAN_LIMITS.guest);
  const restoreRef = useRef<any | null>(null);
  const restoreDoneRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DOCUMENTS_SEEN_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        seenDocsCacheRef.current = true;
        setSeenDocumentIds(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      // Ignore malformed cache
    }
  }, [isHydrated]);

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
      gridTemplateColumns: chatOpen
        ? `minmax(0, 1fr) 6px ${chatWidth}px`
        : "minmax(0, 1fr) 0px 0px",
      ["--main-columns" as any]: chatOpen
        ? `minmax(0, 1fr) 6px ${chatWidth}px`
        : "minmax(0, 1fr) 0px 0px",
    }),
    [chatOpen, chatWidth]
  );

  const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const onMove = (moveEvent: PointerEvent) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const nextWidth = rect.right - moveEvent.clientX;
      const maxWidth = rect.width * 0.8;
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

  const persistSeenDocuments = (next: Set<string>) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(DOCUMENTS_SEEN_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // Ignore storage failures
    }
  };

  const markDocumentSeen = (docId: string) => {
    setSeenDocumentIds((prev) => {
      if (prev.has(docId)) return prev;
      const next = new Set(prev);
      next.add(docId);
      persistSeenDocuments(next);
      return next;
    });
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
        void loadPlan(data.session.access_token);
      } else {
        setUserEmail(null);
        setPlan("guest");
        setPlanLimits(DEFAULT_PLAN_LIMITS.guest);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session));
      if (session) {
        setUserEmail(session.user?.email ?? null);
        void loadDocuments(session.access_token);
        void loadPlan(session.access_token);
        if (selectedDocumentId) {
          void loadChats(selectedDocumentId, session.access_token);
        } else {
          void loadAllChats(session.access_token);
        }
      } else {
        setUserEmail(null);
        setPlan("guest");
        setPlanLimits(DEFAULT_PLAN_LIMITS.guest);
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
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("askpdf:layout"));
  }, [chatOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event("askpdf:layout"));
    });
    return () => cancelAnimationFrame(raf);
  }, [chatWidth]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!event.metaKey || !event.shiftKey || event.key.toLowerCase() !== "b") return;
      event.preventDefault();
      setChatOpen((prev) => !prev);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.key.toLowerCase() !== "b") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier || event.key.toLowerCase() !== "k") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      setChatOpen(true);
      requestAnimationFrame(() => {
        chatInputRef.current?.focus();
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

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
      chatOpen,
      sidebarOpen,
      sidebarListCollapsed,
      sidebarSettingsCollapsed,
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
    chatOpen,
    sidebarOpen,
    sidebarListCollapsed,
    sidebarSettingsCollapsed,
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
      restore.settingsSection === "usage" ||
      restore.settingsSection === "messages" ||
      restore.settingsSection === "manual" ||
      restore.settingsSection === "service" ||
      restore.settingsSection === "faq"
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
    if (!isAuthed || (settingsSection !== "account" && settingsSection !== "usage")) {
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
      const normalized = items.map((item) => ({
        id: String(item.id),
        title: String(item.title ?? t("common.untitled")),
      }));
      setDocuments(normalized);
      if (!seenDocsCacheRef.current && normalized.length > 0) {
        const seed = new Set(normalized.map((doc) => doc.id));
        seenDocsCacheRef.current = true;
        setSeenDocumentIds(seed);
        persistSeenDocuments(seed);
      }
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

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".history-item__menu") || target?.closest(".history-item__menu-trigger")) {
        return;
      }
      setOpenDocMenuId(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".chat__thread-menu") || target?.closest(".chat__thread-menu-trigger")) {
        return;
      }
      setOpenChatMenuId(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleDownloadDocument = async (documentId: string) => {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${documentId}/signed-url`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to get signed url (${response.status})`);
      }
      const payload = await response.json();
      const url = String(payload.signed_url ?? "");
      if (!url) return;
      const fileResponse = await fetch(url);
      if (!fileResponse.ok) {
        throw new Error(`Failed to download PDF (${fileResponse.status})`);
      }
      const blob = await fileResponse.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "document.pdf";
      link.rel = "noopener";
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to download PDF";
      setDocsError(message);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!documentId) return;
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete document (${response.status})`);
      }
      documentChunkCacheRef.current.delete(documentId);
      documentChunkLoadRef.current.delete(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      setOpenDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      if (selectedDocumentId === documentId) {
        setChatThreads([]);
      }
      setAllChatThreads((prev) => prev.filter((thread) => thread.documentId !== documentId));
      if (selectedDocumentId === documentId) {
        handleCloseTab(documentId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete document";
      setDocsError(message);
    }
  };

  const handleDeleteChatThread = async (documentId: string, chatId: string) => {
    if (!documentId || !chatId) return;
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${documentId}/chats/${chatId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete chat (${response.status})`);
      }
      setChatThreads((prev) => prev.filter((thread) => thread.id !== chatId));
      setAllChatThreads((prev) => prev.filter((thread) => thread.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setChatMessages([]);
        setShowThreadList(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete chat";
      setChatError(message);
    }
  };

  const handleReloadDocuments = async () => {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      await loadDocuments(accessToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reload documents";
      setDocsError(message);
    }
  };

  const handleReloadChatsList = async () => {
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) return;
      if (!selectedDocumentId) {
        await loadAllChats(accessToken);
        return;
      }
      await loadChats(selectedDocumentId, accessToken, { autoOpen: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to reload chats";
      setChatError(message);
    }
  };

  const startEditChatFromList = (threadId: string, title: string | null) => {
    setEditingChatListId(threadId);
    setChatListTitleDraft(title?.trim() || t("chat.newChat"));
  };

  const cancelEditChatFromList = () => {
    setEditingChatListId(null);
    setChatListTitleDraft("");
  };

  const saveChatTitleFromList = async (documentId: string, threadId: string) => {
    const nextTitle = chatListTitleDraft.trim();
    if (!nextTitle) {
      cancelEditChatFromList();
      return;
    }
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${documentId}/chats/${threadId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: nextTitle }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update chat title (${response.status})`);
      }
      setChatThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, title: nextTitle } : thread
        )
      );
      setAllChatThreads((prev) =>
        prev.map((thread) =>
          thread.id === threadId ? { ...thread, title: nextTitle } : thread
        )
      );
      if (activeChatId === threadId) {
        setChatTitleDraft(nextTitle);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update chat title";
      setChatError(message);
    } finally {
      cancelEditChatFromList();
    }
  };

  const handleRenameChatFromList = async (
    threadId: string,
    documentId?: string | null
  ) => {
    if (!threadId) return;
    startEditChatFromList(threadId, null);
  };

  useEffect(() => {
    if (!pendingRenameChatId) return;
    setPendingRenameChatId(null);
  }, [pendingRenameChatId]);

  const loadPlan = async (accessToken: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/plans/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load plan (${response.status})`);
      }
      const payload = await response.json();
      const nextPlan =
        payload?.plan === "free" ||
        payload?.plan === "plus" ||
        payload?.plan === "pro"
          ? payload.plan
          : "free";
      const limits = payload?.limits ?? {};
      setPlan(nextPlan);
      setPlanLimits({
        maxFiles:
          typeof limits.maxFiles === "number" ? limits.maxFiles : DEFAULT_PLAN_LIMITS[nextPlan].maxFiles,
        maxFileMb:
          typeof limits.maxFileMb === "number" ? limits.maxFileMb : DEFAULT_PLAN_LIMITS[nextPlan].maxFileMb,
        maxMessagesPerThread:
          typeof limits.maxMessagesPerThread === "number"
            ? limits.maxMessagesPerThread
            : DEFAULT_PLAN_LIMITS[nextPlan].maxMessagesPerThread,
        maxThreadsPerDocument:
          typeof limits.maxThreadsPerDocument === "number"
            ? limits.maxThreadsPerDocument
            : DEFAULT_PLAN_LIMITS[nextPlan].maxThreadsPerDocument,
      });
    } catch {
      setPlan("free");
      setPlanLimits(DEFAULT_PLAN_LIMITS.free);
    }
  };

  const handleUploadClick = () => {
    if (!isAuthed) return;
    fileInputRef.current?.click();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (planLimits.maxFiles !== null && documents.length >= planLimits.maxFiles) {
      setDocsError(t("errors.documentLimit", { limit: planLimits.maxFiles }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (
      planLimits.maxFileMb !== null &&
      file.size > planLimits.maxFileMb * 1024 * 1024
    ) {
      setDocsError(t("errors.fileSizeLimit", { limit: planLimits.maxFileMb }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
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
    markDocumentSeen(doc.id);
    setSelectedTabId(doc.id);
    setSelectedDocumentId(doc.id);
    setSelectedDocumentTitle(doc.title);
    setOpenDocuments((prev) => {
      if (prev.some((item) => item.id === doc.id)) return prev;
      return [...prev, { id: doc.id, title: doc.title }];
    });
    setSelectedDocumentUrl(null);
    setSelectedDocumentResult(null);
    setSelectedDocumentAnnotations(null);
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
      if (USE_CLIENT_RAG) {
        void loadDocumentChunkCache(doc.id, accessToken);
      }
      const chatsTask = (async () => {
        const chatsStart = performance.now();
        const threads = await loadChats(doc.id, accessToken, {
          autoOpen: options.autoOpenChat ?? true,
        });
        console.info(
          "[perf] loadChats",
          Math.round(performance.now() - chatsStart),
          "ms"
        );
        if (options.restoreChatId) {
          const target = options.restoreChatId;
          const exists = threads.some((thread) => thread.id === target);
          if (exists) {
            setActiveChatId(target);
            setShowThreadList(false);
            await loadChatMessages(doc.id, target, accessToken);
          }
        }
      })().catch((error) => {
        console.warn("[loadChats] failed", error);
      });
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      signedUrlAbortRef.current?.abort();
      const controller = new AbortController();
      signedUrlAbortRef.current = controller;
      const signedStart = performance.now();
      const cachedBundle = bundleCacheRef.current.get(doc.id);
      if (
        cachedBundle &&
        cachedBundle.signedUrl &&
        cachedBundle.expiresAt * 1000 > Date.now() + 30000
      ) {
        setSelectedDocumentUrl(cachedBundle.signedUrl);
        setSelectedDocumentResult(cachedBundle.result ?? null);
        setSelectedDocumentAnnotations(cachedBundle.annotations ?? {});
      } else {
        const response = await fetch(`${baseUrl}/documents/${doc.id}/bundle`, {
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
        const annotations =
          payload.annotations && typeof payload.annotations === "object"
            ? payload.annotations
            : {};
        setSelectedDocumentUrl(url);
        setSelectedDocumentResult(payload.result ?? null);
        setSelectedDocumentAnnotations(annotations);
        if (typeof payload.expires_at === "number") {
          bundleCacheRef.current.set(doc.id, {
            signedUrl: url,
            expiresAt: payload.expires_at,
            result: payload.result ?? null,
            annotations,
          });
        }
        console.info(
          "[perf] bundle",
          Math.round(performance.now() - signedStart),
          "ms"
        );
      }
      void chatsTask;
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
      setSelectedDocumentResult(null);
      setSelectedDocumentAnnotations(null);
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
        setSelectedDocumentResult(null);
        setSelectedDocumentAnnotations(null);
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
  }, [openDocuments.length, chatWidth, chatOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleRefClick = async (refId: string, options: { documentId?: string } = {}) => {
    const targetDocumentId = options.documentId ?? selectedDocumentId;
    if (!targetDocumentId) return;
    const refKey = `${targetDocumentId}:${refId}`;
    if (activeRefId === refKey) {
      setReferenceRequest(null);
      setActiveRefId(null);
      return;
    }
    if (options.documentId && options.documentId !== selectedDocumentId) {
      const doc = documents.find((item) => item.id === options.documentId);
      if (!doc) return;
      await handleSelectDocument(doc, { autoOpenChat: false });
    }
    const chunkId = refId.startsWith("chunk-") ? refId.slice(6) : refId;
    if (!chunkId) return;
    try {
      setActiveRefId(refKey);
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
        `${baseUrl}/documents/${targetDocumentId}/chunks/${chunkId}`,
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
  const planLabel =
    plan === "guest"
      ? t("planGuest")
      : plan === "plus"
        ? t("planPlus")
        : plan === "pro"
          ? t("planPro")
          : t("planFree");

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

  const buildEmbeddingVector = (value: unknown) => {
    if (!Array.isArray(value)) return null;
    const numbers = value
      .map((item) => (typeof item === "number" ? item : Number(item)))
      .filter((item) => Number.isFinite(item));
    if (numbers.length === 0) return null;
    return new Float32Array(numbers);
  };

  const calcVectorNorm = (vector: Float32Array) => {
    let sum = 0;
    for (let i = 0; i < vector.length; i += 1) {
      const val = vector[i];
      sum += val * val;
    }
    return Math.sqrt(sum);
  };

  const dotProduct = (a: Float32Array, b: Float32Array) => {
    const len = Math.min(a.length, b.length);
    let sum = 0;
    for (let i = 0; i < len; i += 1) {
      sum += a[i] * b[i];
    }
    return sum;
  };

  const loadDocumentChunkCache = async (documentId: string, accessToken: string) => {
    if (!documentId) return null;
    const cached = documentChunkCacheRef.current.get(documentId);
    if (cached) return cached;
    const inflight = documentChunkLoadRef.current.get(documentId);
    if (inflight) return inflight;
    const promise = (async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${documentId}/chunks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to load chunks (${response.status})`);
      }
      const payload = await response.json();
      const items = Array.isArray(payload.chunks) ? payload.chunks : [];
      const chunks: ClientChunk[] = [];
      for (const item of items) {
        const embedding = buildEmbeddingVector(item?.embedding);
        if (!embedding) continue;
        const norm = calcVectorNorm(embedding);
        if (!Number.isFinite(norm) || norm === 0) continue;
        chunks.push({
          id: String(item.id),
          documentId: String(item.documentId ?? documentId),
          content: String(item.content ?? ""),
          metadata: item.metadata ?? null,
          embedding,
          norm,
        });
      }
      const cache: ChunkCache = {
        loadedAt: Date.now(),
        chunks,
      };
      documentChunkCacheRef.current.set(documentId, cache);
      return cache;
    })();
    documentChunkLoadRef.current.set(documentId, promise);
    try {
      return await promise;
    } catch {
      return null;
    } finally {
      documentChunkLoadRef.current.delete(documentId);
    }
  };

  const fetchQueryEmbedding = async (
    text: string,
    documentId: string,
    accessToken: string
  ) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(`${baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, document_id: documentId }),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    return Array.isArray(payload.embedding) ? payload.embedding : null;
  };

  const getClientMatches = async (
    question: string,
    documentId: string,
    accessToken: string
  ) => {
    if (!USE_CLIENT_RAG) return null;
    const cache = documentChunkCacheRef.current.get(documentId);
    if (!cache || cache.chunks.length === 0) return null;
    const embedding = await fetchQueryEmbedding(question, documentId, accessToken);
    if (!embedding) return null;
    const query = buildEmbeddingVector(embedding);
    if (!query) return null;
    const queryNorm = calcVectorNorm(query);
    if (!Number.isFinite(queryNorm) || queryNorm === 0) return null;
    const scored = cache.chunks.map((chunk) => ({
      chunk,
      similarity: dotProduct(query, chunk.embedding) / (queryNorm * chunk.norm),
    }));
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, CLIENT_MATCH_MAX).map(({ chunk, similarity }) => ({
      id: chunk.id,
      content: chunk.content,
      metadata: chunk.metadata,
      similarity,
      documentId: chunk.documentId,
    }));
  };


  const sendMessage = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    if (chatSending) return;
    if (!selectedDocumentId || !activeChatId) return;
    const userMessageCount = chatMessages.filter((msg) => msg.role === "user").length;
    if (
      planLimits.maxMessagesPerThread !== null &&
      userMessageCount >= planLimits.maxMessagesPerThread
    ) {
      setChatError(t("errors.messageLimit", { limit: planLimits.maxMessagesPerThread }));
      return;
    }
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
      const clientMatches =
        USE_CLIENT_RAG && selectedDocumentId && accessToken
          ? await getClientMatches(question, selectedDocumentId, accessToken)
          : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const wsUrl = `${baseUrl.replace(/^http/, "ws")}/documents/${selectedDocumentId}/chats/${activeChatId}/assistant/ws?token=${encodeURIComponent(
        accessToken
      )}`;
      await new Promise<void>((resolve, reject) => {
        const socket = new WebSocket(wsUrl);
        chatSocketRef.current = socket;
        const payloadObj: Record<string, any> = {
          message: question,
          message_id: options.existingId ?? null,
          mode: chatMode,
        };
        if (clientMatches && clientMatches.length > 0) {
          payloadObj.client_matches = clientMatches;
        }
        const payload = JSON.stringify(payloadObj);
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
                <div className="settings__item-title">{t("aiTuning")}</div>
                <div className="settings__item-desc">{t("aiTuningDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("aiPersonalize")}</div>
                <div className="settings__item-desc">{t("aiPersonalizeDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "account") {
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
                {planLabel}
              </div>
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
    if (settingsSection === "usage") {
      const currentUsage = usageSummary?.current;
      const allTimeUsage = usageSummary?.allTime;
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
      const allTimeValue = usageLoading
        ? t("common.loading")
        : usageError
          ? t("common.fetchFailed")
          : allTimeUsage
            ? t("usage.summary", {
                tokens: formatNumber(allTimeUsage.totalTokens),
                pages: formatNumber(allTimeUsage.pages),
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
          <h2 className="settings__title">{t("usageTab")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("usageThisMonth")}</div>
                <div className="settings__item-desc">{t("usageThisMonthDesc")}</div>
              </div>
              <div className="settings__value">{usageValue}</div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("usageAllTime")}</div>
                <div className="settings__item-desc">{t("usageAllTimeDesc")}</div>
              </div>
              <div className="settings__value">{allTimeValue}</div>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("usageCost")}</div>
                <div className="settings__item-desc">{t("usageCostDesc")}</div>
              </div>
              <div className="settings__value">{usageCost}</div>
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
                <div className="settings__item-title">{t("messages.noticeTitle")}</div>
                <div className="settings__item-desc">{t("messages.noticeDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.feedbackTitle")}</div>
                <div className="settings__item-desc">{t("messages.feedbackDesc")}</div>
              </div>
              <select className="settings__select">
                <option>{t("common.on")}</option>
                <option>{t("common.off")}</option>
              </select>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("messages.contactTitle")}</div>
                <div className="settings__item-desc">{t("messages.contactDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "service") {
      return (
        <>
          <h2 className="settings__title">{t("serviceTitle")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("servicePlanTitle")}</div>
                <div className="settings__item-desc">{t("servicePlanDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("servicePolicyTitle")}</div>
                <div className="settings__item-desc">{t("servicePolicyDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
              </button>
            </div>
          </div>
        </>
      );
    }
    if (settingsSection === "faq") {
      return (
        <>
          <h2 className="settings__title">{t("faqTitle")}</h2>
          <div className="settings__group">
            <div className="settings__item">
              <div>
                <div className="settings__item-title">{t("faqGeneralTitle")}</div>
                <div className="settings__item-desc">{t("faqGeneralDesc")}</div>
              </div>
              <button type="button" className="settings__btn">
                {t("open")}
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
    if (
      planLimits.maxThreadsPerDocument !== null &&
      chatThreads.length >= planLimits.maxThreadsPerDocument
    ) {
      setChatError(t("errors.threadLimit", { limit: planLimits.maxThreadsPerDocument }));
      return;
    }
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

  const applyDocumentTitleUpdate = (docId: string, title: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, title } : doc))
    );
    setOpenDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, title } : doc))
    );
    setAllChatThreads((prev) =>
      prev.map((thread) =>
        thread.documentId === docId ? { ...thread, documentTitle: title } : thread
      )
    );
    if (selectedDocumentId === docId) {
      setSelectedDocumentTitle(title);
    }
  };

  const startRenameDocument = (doc: DocumentItem) => {
    setEditingDocumentId(doc.id);
    setDocumentTitleDraft(doc.title);
  };

  const cancelRenameDocument = () => {
    setEditingDocumentId(null);
    setDocumentTitleDraft("");
  };

  const saveRenameDocument = async (docId: string) => {
    const nextTitle = documentTitleDraft.trim();
    if (!nextTitle) {
      cancelRenameDocument();
      return;
    }
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(`${baseUrl}/documents/${docId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!response.ok) {
        throw new Error(`Failed to rename (${response.status})`);
      }
      applyDocumentTitleUpdate(docId, nextTitle);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Rename failed";
      setDocsError(message);
    } finally {
      cancelRenameDocument();
    }
  };

  const startEditChatTitle = () => {
    if (!activeChatId || showThreadList) return;
    const current =
      chatThreads.find((thread) => thread.id === activeChatId)?.title ??
      t("chat.newChat");
    setEditingChatTitle(true);
    setChatTitleDraft(current);
  };

  const cancelEditChatTitle = () => {
    setEditingChatTitle(false);
    setChatTitleDraft("");
  };

  const saveChatTitle = async () => {
    if (!selectedDocumentId || !activeChatId) return;
    const nextTitle = chatTitleDraft.trim();
    if (!nextTitle) {
      cancelEditChatTitle();
      return;
    }
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        throw new Error("Not authenticated");
      }
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
      const response = await fetch(
        `${baseUrl}/documents/${selectedDocumentId}/chats/${activeChatId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: nextTitle }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to update chat title (${response.status})`);
      }
      setChatThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeChatId ? { ...thread, title: nextTitle } : thread
        )
      );
      setAllChatThreads((prev) =>
        prev.map((thread) =>
          thread.id === activeChatId ? { ...thread, title: nextTitle } : thread
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update chat title";
      setChatError(message);
    } finally {
      cancelEditChatTitle();
    }
  };

  return (
    <main className={`app ${sidebarOpen ? "" : "app--sidebar-closed"}`}>
      <section className="sidebar">
        <div className="sidebar__header sidebar__header--primary">
          <span className="logo" aria-hidden="true">
            <img className="logo__icon" src="/icon.svg" alt="" />
          </span>
          <span className="brand">AskPDF</span>
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
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12" />
              <path d="M9 4l0 16" />
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
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="visually-hidden"
          />
        </div>

        <div className="sidebar__list sidebar__list--settings">
          <div
            className="sidebar__list-header"
            role="button"
            tabIndex={0}
            onClick={() => setSidebarSettingsCollapsed((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSidebarSettingsCollapsed((prev) => !prev);
              }
            }}
            aria-label={
              sidebarSettingsCollapsed ? t("sidebar.expandList") : t("sidebar.collapseList")
            }
            data-tooltip={
              sidebarSettingsCollapsed ? t("sidebar.expandList") : t("sidebar.collapseList")
            }
          >
            <span className="sidebar__list-title">
              <span className="sidebar__list-icon" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065" />
                  <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                </svg>
              </span>
              {t("sidebar.settings")}
            </span>
            <span className="sidebar__list-indicator" aria-hidden="true">
              {sidebarSettingsCollapsed ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              )}
            </span>
          </div>
          <div
            className={`sidebar__list-body ${sidebarSettingsCollapsed ? "is-collapsed" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="history-item"
              onClick={() => openSettingsSection("general")}
              aria-label={t("general")}
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
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M12 6a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M4 6l8 0" />
                <path d="M16 6l4 0" />
                <path d="M6 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M4 12l2 0" />
                <path d="M10 12l10 0" />
                <path d="M15 18a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M4 18l11 0" />
                <path d="M19 18l1 0" />
              </svg>
              <span className="label">{t("general")}</span>
            </button>
            <button
              type="button"
              className="history-item"
              onClick={() => openSettingsSection("messages")}
              aria-label={t("notifications")}
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
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
                <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
              </svg>
              <span className="label">{t("notifications")}</span>
            </button>
            <button
              type="button"
              className="history-item"
              onClick={() => openSettingsSection("account")}
              aria-label={t("tooltip.account")}
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
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20a8 8 0 0 1 16 0" />
              </svg>
              <span className="label">{t("tooltip.account")}</span>
            </button>
          </div>
        </div>

        <div className="sidebar__list">
          <div
            className="sidebar__list-header"
            role="button"
            tabIndex={0}
            onClick={() => setSidebarListCollapsed((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSidebarListCollapsed((prev) => !prev);
              }
            }}
            aria-label={
              sidebarListCollapsed ? t("sidebar.expandList") : t("sidebar.collapseList")
            }
            data-tooltip={
              sidebarListCollapsed ? t("sidebar.expandList") : t("sidebar.collapseList")
            }
          >
            <span className="sidebar__list-title">
              <span className="sidebar__list-icon" aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
                </svg>
              </span>
              {t("sidebar.documents")}
            </span>
            <span className="sidebar__list-indicator" aria-hidden="true">
              {sidebarListCollapsed ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6l-6 6" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              )}
            </span>
          </div>
          <div
            className={`sidebar__list-body ${sidebarListCollapsed ? "is-collapsed" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >
          {isAuthed ? (
            docsLoading ? (
              <div className="auth-hint auth-hint--inline">
                <p>{renderLoadingText(t("common.loading"))}</p>
                <button
                  type="button"
                  className="list-reload"
                  onClick={handleReloadDocuments}
                  aria-label={t("common.reload")}
                  data-tooltip={t("common.reload")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
                    <path d="M20 4v5h-5" />
                  </svg>
                </button>
              </div>
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
                  onClick={() => {
                    if (editingDocumentId === doc.id) return;
                    handleSelectDocument(doc);
                  }}
                  data-tooltip={doc.title}
                >
                  {editingDocumentId === doc.id ? (
                    <input
                      className="history-item__input"
                      value={documentTitleDraft}
                      onChange={(event) => setDocumentTitleDraft(event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveRenameDocument(doc.id);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          cancelRenameDocument();
                        }
                      }}
                      onBlur={() => void saveRenameDocument(doc.id)}
                      aria-label={t("aria.renameDocument")}
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="history-item__label-row">
                        <span className="label history-item__label">{doc.title}</span>
                        {!seenDocumentIds.has(doc.id) ? (
                          <span className="history-item__badge">NEW</span>
                        ) : null}
                      </span>
                      {sidebarOpen ? (
                        <span
                          role="button"
                          tabIndex={0}
                          className="history-item__menu-trigger"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenDocMenuId((prev) => (prev === doc.id ? null : doc.id));
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              setOpenDocMenuId((prev) => (prev === doc.id ? null : doc.id));
                            }
                          }}
                          aria-label={t("tooltip.menu")}
                          data-tooltip={t("tooltip.menu")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                          </svg>
                        </span>
                      ) : null}
                      {sidebarOpen && openDocMenuId === doc.id ? (
                        <div className="history-item__menu" onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            className="history-item__menu-item"
                            onClick={() => {
                              setOpenDocMenuId(null);
                              startRenameDocument(doc);
                            }}
                          >
                            <span className="menu-item__icon" aria-hidden="true">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                <path d="M13.5 6.5l4 4" />
                              </svg>
                            </span>
                            <span className="menu-item__label">{t("tooltip.rename")}</span>
                          </button>
                          <button
                            type="button"
                            className="history-item__menu-item"
                            onClick={() => {
                              setOpenDocMenuId(null);
                              void handleDownloadDocument(doc.id);
                            }}
                          >
                            <span className="menu-item__icon" aria-hidden="true">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                                <path d="M7 11l5 5l5 -5" />
                                <path d="M12 4l0 12" />
                              </svg>
                            </span>
                            <span className="menu-item__label">{t("pdf.download")}</span>
                          </button>
                          <button
                            type="button"
                            className="history-item__menu-item history-item__menu-item--danger"
                            onClick={() => {
                              setOpenDocMenuId(null);
                              void handleDeleteDocument(doc.id);
                            }}
                          >
                            <span className="menu-item__icon" aria-hidden="true">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M4 7l16 0" />
                                <path d="M10 11l0 6" />
                                <path d="M14 11l0 6" />
                                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                              </svg>
                            </span>
                            <span className="menu-item__label">{t("common.delete")}</span>
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
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
      <section className="main" style={mainStyle} ref={containerRef}>
        <div className="main-toolbar">
          <div className="main-toolbar__left">
            <span className="main-toolbar__title">
              {selectedDocumentTitle ? selectedDocumentTitle : t("viewer.noDocument")}
            </span>
          </div>
          <div className="main-toolbar__right" />
        </div>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-left"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M11 7l-5 5l5 5" />
                <path d="M17 7l-5 5l5 5" />
              </svg>
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
                  data-tooltip={doc.title}
                  data-tooltip-position="bottom"
                >
                  <span className="viewer__tab-label">
                    {doc.title}
                  </span>
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
              aria-label="scroll right"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="icon icon-tabler icons-tabler-outline icon-tabler-chevrons-right"
                aria-hidden="true"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 7l5 5l-5 5" />
                <path d="M13 7l5 5l-5 5" />
              </svg>
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
                      <div className="settings__plan">{planLabel}</div>
                    </div>
                  </div>
                  <div className="settings__nav-group">
                    {[
                      { id: "general", label: t("general") },
                      { id: "ai", label: t("ai") },
                      { id: "account", label: t("account") },
                      { id: "usage", label: t("usageTab") },
                      { id: "messages", label: t("messages.title") },
                      { id: "manual", label: t("manual.title") },
                      { id: "service", label: t("serviceTitle") },
                      { id: "faq", label: t("faqTitle") },
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
                initialResult={selectedDocumentResult}
                initialAnnotations={selectedDocumentAnnotations}
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
              <div className="empty-state">
                <div className="empty-state__icon" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-file"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
                  </svg>
                </div>
                <div className="empty-state__title">{t("viewer.noDocument")}</div>
                <div className="empty-state__subtitle">
                  <button
                    type="button"
                    className="empty-state__link"
                    onClick={handleUploadClick}
                    disabled={!isAuthed || uploading}
                  >
                    {t("viewer.uploadAction")}
                  </button>
                  <span>{t("viewer.emptySuffix")}</span>
                </div>
              </div>
            )}
            {tooltipContainer
              ? createPortal(
                  <div
                    className="ref-tooltip"
                    style={{
                      left: `${refTooltip.x}px`,
                      top: `${refTooltip.y}px`,
                      opacity: refTooltip.visible ? 1 : 0,
                      pointerEvents: refTooltip.visible ? "auto" : "none",
                    }}
                    onMouseEnter={() =>
                      setRefTooltip((prev) => (prev.visible ? prev : { ...prev, visible: true }))
                    }
                    onMouseMove={() => {
                      if (!refTooltip.visible) return;
                      const rect = refTooltip.anchor;
                      if (!rect) return;
                      const { x, y } = computeRefTooltipPosition(rect);
                      setRefTooltip((prev) => ({ ...prev, x, y }));
                    }}
                    onMouseLeave={hideRefTooltip}
                  >
                    <div className="ref-tooltip__header">
                      <div className="ref-tooltip__header-title">
                        <span className="ref-tooltip__title">
                          {refTooltip.refId
                            ? getRefPreviewData(
                                refTooltip.refId,
                                refTooltip.documentId ?? undefined
                              )?.documentTitle || refTooltip.title
                            : refTooltip.title}
                        </span>
                      </div>
                      <div className="ref-tooltip__header-page">
                        {(() => {
                          if (!refTooltip.refId) return null;
                          const preview = getRefPreviewData(
                            refTooltip.refId,
                            refTooltip.documentId ?? undefined
                          );
                          const page =
                            getRefPageLabel(preview?.metadata) ?? refTooltip.pageLabel;
                          return page ? <span className="ref-tooltip__page">{page}</span> : null;
                        })()}
                      </div>
                    </div>
                    <div className="ref-tooltip__body" ref={refTooltipBodyRef}>
                      {`...${
                        refTooltip.refId
                          ? getRefPreviewData(
                              refTooltip.refId,
                              refTooltip.documentId ?? undefined
                            )?.text || refTooltip.text
                          : refTooltip.text
                      }...`}
                    </div>
                  </div>,
                  tooltipContainer
                )
              : null}
            <button
              type="button"
              className="viewer__chat-toggle"
              onClick={() => setChatOpen((prev) => !prev)}
              aria-label={chatOpen ? "Collapse chat" : "Expand chat"}
              data-tooltip={chatOpen ? t("tooltip.chatCollapse") : t("tooltip.chatExpand")}
              data-tooltip-portal="true"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                {chatOpen ? (
                  <polyline
                    points="9 6 15 12 9 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <polyline
                    points="15 6 9 12 15 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </section>

        {chatOpen ? (
          <div
            className="resizer"
            role="separator"
            aria-orientation="vertical"
            onPointerDown={handleResizeStart}
          />
        ) : null}

        <section className={`chat ${chatOpen ? "" : "chat--collapsed"}`}>
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
                <span className="chat__header-icon" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#536DFE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-robot-face"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                    <path d="M9 16c1 .667 2 1 3 1s2 -.333 3 -1" />
                    <path d="M9 7l-1 -4" />
                    <path d="M15 7l1 -4" />
                    <path d="M9 12v-1" />
                    <path d="M15 12v-1" />
                  </svg>
                </span>
                {editingChatTitle && activeChatId && !showThreadList ? (
                  <input
                    className="chat__header-input"
                    value={chatTitleDraft}
                    onChange={(event) => setChatTitleDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void saveChatTitle();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        cancelEditChatTitle();
                      }
                    }}
                    onBlur={() => void saveChatTitle()}
                    aria-label={t("aria.renameChat")}
                    autoFocus
                  />
                ) : (
                  <span
                    className="chat__header-title"
                    onClick={startEditChatTitle}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        startEditChatTitle();
                      }
                    }}
                  >
                    {activeChatTitle}
                  </span>
                )}
              </div>
            ) : (
              <div className="chat__header-left">
                <span className="chat__header-icon" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#536DFE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-robot-face"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                    <path d="M9 16c1 .667 2 1 3 1s2 -.333 3 -1" />
                    <path d="M9 7l-1 -4" />
                    <path d="M15 7l1 -4" />
                    <path d="M9 12v-1" />
                    <path d="M15 12v-1" />
                  </svg>
                </span>
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
                </>
              ) : null}
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
                <div className="empty-state">
                  <div className="empty-state__row">
                    {renderLoadingText(t("common.loading"))}
                    <button
                      type="button"
                      className="list-reload"
                      onClick={handleReloadChatsList}
                      aria-label={t("common.reload")}
                      data-tooltip={t("common.reload")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747" />
                        <path d="M20 4v5h-5" />
                      </svg>
                    </button>
                  </div>
                </div>
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
                        onClick={() => {
                          if (editingChatListId === thread.id) return;
                          handleSelectDocument({
                            id: thread.documentId,
                            title: thread.documentTitle ?? t("common.untitled"),
                          });
                        }}
                      >
                        <div className="chat__thread-row">
                          {editingChatListId === thread.id ? (
                            <input
                              className="chat__thread-input"
                              value={chatListTitleDraft}
                              onChange={(event) => setChatListTitleDraft(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void saveChatTitleFromList(thread.documentId, thread.id);
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelEditChatFromList();
                                }
                              }}
                              onBlur={() => void saveChatTitleFromList(thread.documentId, thread.id)}
                              aria-label={t("aria.renameChat")}
                              autoFocus
                            />
                          ) : (
                            <div className="chat__thread-title">
                              {thread.title ?? t("chat.newChat")}
                            </div>
                          )}
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                          <span
                            role="button"
                            tabIndex={0}
                            className="chat__thread-menu-trigger"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenChatMenuId((prev) => (prev === thread.id ? null : thread.id));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                setOpenChatMenuId((prev) => (prev === thread.id ? null : thread.id));
                              }
                            }}
                            aria-label={t("tooltip.menu")}
                            data-tooltip={t("tooltip.menu")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
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
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                              <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                              <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            </svg>
                          </span>
                        </div>
                        {openChatMenuId === thread.id ? (
                          <div
                            className="chat__thread-menu"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="chat__thread-menu-item"
                              onClick={() => {
                                setOpenChatMenuId(null);
                                startEditChatFromList(thread.id, thread.title ?? null);
                              }}
                            >
                              <span className="menu-item__icon" aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                                </svg>
                              </span>
                              <span className="menu-item__label">{t("tooltip.rename")}</span>
                            </button>
                            <button
                              type="button"
                              className="chat__thread-menu-item chat__thread-menu-item--danger"
                              onClick={() => {
                                setOpenChatMenuId(null);
                                void handleDeleteChatThread(thread.documentId, thread.id);
                              }}
                            >
                              <span className="menu-item__icon" aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M4 7l16 0" />
                                  <path d="M10 11l0 6" />
                                  <path d="M14 11l0 6" />
                                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                </svg>
                              </span>
                              <span className="menu-item__label">{t("common.delete")}</span>
                            </button>
                          </div>
                        ) : null}
                        <div className="chat__thread-meta">
                          {thread.documentTitle ?? t("common.untitled")}
                        </div>
                      </button>
                    ))}
                  </div>
                )
              ) : showThreadList ? (
                chatThreads.length === 0 ? (
                  <div className="empty-state">
                    <div>{t("chat.noDocumentChats")}</div>
                    <button type="button" className="primary" onClick={handleCreateChat}>
                      {t("chat.newChat")}
                    </button>
                  </div>
                ) : (
                  <div className="chat__thread-list">
                    {chatThreads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        className="chat__thread-item"
                        onClick={async () => {
                          if (editingChatListId === thread.id) return;
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
                          {editingChatListId === thread.id ? (
                            <input
                              className="chat__thread-input"
                              value={chatListTitleDraft}
                              onChange={(event) => setChatListTitleDraft(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  if (selectedDocumentId) {
                                    void saveChatTitleFromList(selectedDocumentId, thread.id);
                                  }
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelEditChatFromList();
                                }
                              }}
                              onBlur={() => {
                                if (selectedDocumentId) {
                                  void saveChatTitleFromList(selectedDocumentId, thread.id);
                                }
                              }}
                              aria-label={t("aria.renameChat")}
                              autoFocus
                            />
                          ) : (
                            <div className="chat__thread-title">
                              {thread.title ?? t("chat.newChat")}
                            </div>
                          )}
                          {thread.updatedAt ? (
                            <span className="chat__thread-time">
                              {formatRelativeTime(thread.updatedAt)}
                            </span>
                          ) : null}
                          <span
                            role="button"
                            tabIndex={0}
                            className="chat__thread-menu-trigger"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenChatMenuId((prev) => (prev === thread.id ? null : thread.id));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                setOpenChatMenuId((prev) => (prev === thread.id ? null : thread.id));
                              }
                            }}
                            aria-label={t("tooltip.menu")}
                            data-tooltip={t("tooltip.menu")}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
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
                              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                              <path d="M4 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                              <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                              <path d="M18 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                            </svg>
                          </span>
                        </div>
                        {openChatMenuId === thread.id ? (
                          <div
                            className="chat__thread-menu"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="chat__thread-menu-item"
                              onClick={() => {
                                setOpenChatMenuId(null);
                                startEditChatFromList(thread.id, thread.title ?? null);
                              }}
                            >
                              <span className="menu-item__icon" aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                  <path d="M13.5 6.5l4 4" />
                                </svg>
                              </span>
                              <span className="menu-item__label">{t("tooltip.rename")}</span>
                            </button>
                            <button
                              type="button"
                              className="chat__thread-menu-item chat__thread-menu-item--danger"
                              onClick={() => {
                                setOpenChatMenuId(null);
                                if (selectedDocumentId) {
                                  void handleDeleteChatThread(selectedDocumentId, thread.id);
                                }
                              }}
                            >
                              <span className="menu-item__icon" aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M4 7l16 0" />
                                  <path d="M10 11l0 6" />
                                  <path d="M14 11l0 6" />
                                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                </svg>
                              </span>
                              <span className="menu-item__label">{t("common.delete")}</span>
                            </button>
                          </div>
                        ) : null}
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
                  const displayText =
                    msg.role === "assistant"
                      ? msg.text
                      : replaceRefTags(msg.text, msg.refs);
                  const refLabelLookup = buildRefLabelLookup(msg.refs);
                  const refIdLookup = buildRefIdLookup(msg.refs);
                  return (
                  <div key={msg.id} className={`bubble bubble--${msg.role}`}>
                    {msg.status === "loading" ? (
                      msg.text ? (
                        <div className="bubble__content markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a: ({ href, children }) => {
                                const parsed = parseRefHref(href);
                                if (parsed) {
                                  const ref = refIdLookup.get(parsed.refId);
                                  return (
                                    <button
                                      type="button"
                                      className="ref ref--inline"
                                      onClick={() =>
                                        handleRefClick(parsed.refId, {
                                          documentId: parsed.documentId,
                                        })
                                      }
                                      onMouseEnter={() =>
                                        ensureRefPreview(parsed.refId, parsed.documentId)
                                      }
                                      title={getRefPreviewTitle(
                                        parsed.refId,
                                        parsed.documentId,
                                        ref?.label ?? ""
                                      )}
                                    >
                                      {children}
                                    </button>
                                  );
                                }
                                const labelText = getNodeText(children)
                                  .replace(/\s+/g, " ")
                                  .trim();
                                const matchedRef =
                                  labelText ? refLabelLookup.get(labelText) : undefined;
                                if (matchedRef) {
                                  return (
                                    <button
                                      type="button"
                                      className="ref ref--inline"
                                      onClick={() =>
                                        handleRefClick(matchedRef.id, {
                                          documentId: matchedRef.documentId,
                                        })
                                      }
                                      onMouseEnter={() =>
                                        ensureRefPreview(matchedRef.id, matchedRef.documentId)
                                      }
                                      title={getRefPreviewTitle(
                                        matchedRef.id,
                                        matchedRef.documentId,
                                        matchedRef.label ?? ""
                                      )}
                                    >
                                      {children}
                                    </button>
                                  );
                                }
                                return (
                                  <a href={href} target="_blank" rel="noreferrer">
                                    {children}
                                  </a>
                                );
                              },
                            }}
                          >
                            {buildRefLinkedText(msg.text, msg.refs)}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{renderLoadingText(t("chat.answering"))}</p>
                      )
                    ) : msg.status === "error" || msg.status === "stopped" ? (
                      <div className="bubble__row">
                        <p className="bubble__content">{displayText}</p>
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
                        <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => {
                            const parsed = parseRefHref(href);
                            if (parsed) {
                              const ref = refIdLookup.get(parsed.refId);
                              return (
                                <button
                                  type="button"
                                  className="ref ref--inline"
                                  onClick={() =>
                                    handleRefClick(parsed.refId, {
                                      documentId: parsed.documentId,
                                    })
                                  }
                                  onMouseEnter={(event) => {
                                    ensureRefPreview(parsed.refId, parsed.documentId);
                                    showRefTooltip(
                                      event,
                                      parsed.refId,
                                      parsed.documentId,
                                      ref?.label ?? ""
                                    );
                                  }}
                                  onMouseMove={(event) =>
                                    showRefTooltip(
                                      event,
                                      parsed.refId,
                                                  parsed.documentId,
                                      ref?.label ?? ""
                                    )
                                  }
                                  onMouseLeave={handleRefButtonLeave}
                                            >
                                              {children}
                                            </button>
                                          );
                                        }
                            const labelText = getNodeText(children)
                              .replace(/\s+/g, " ")
                              .trim();
                            const matchedRef =
                              labelText ? refLabelLookup.get(labelText) : undefined;
                            if (matchedRef) {
                              return (
                                <button
                                  type="button"
                                  className="ref ref--inline"
                                  onClick={() =>
                                    handleRefClick(matchedRef.id, {
                                      documentId: matchedRef.documentId,
                                    })
                                  }
                                  onMouseEnter={(event) => {
                                    ensureRefPreview(matchedRef.id, matchedRef.documentId);
                                    showRefTooltip(
                                      event,
                                      matchedRef.id,
                                      matchedRef.documentId,
                                      matchedRef.label ?? ""
                                    );
                                  }}
                                  onMouseMove={(event) =>
                                    showRefTooltip(
                                      event,
                                      matchedRef.id,
                                                  matchedRef.documentId,
                                      matchedRef.label ?? ""
                                    )
                                  }
                                  onMouseLeave={handleRefButtonLeave}
                                            >
                                              {children}
                                            </button>
                                          );
                                        }
                            return (
                              <a href={href} target="_blank" rel="noreferrer">
                                {children}
                              </a>
                            );
                          },
                          }}
                        >
                          {buildRefLinkedText(msg.text, msg.refs)}
                        </ReactMarkdown>
                        {msg.status === "stopped" ? (
                          <p className="bubble__stopped">{t("chat.stopped")}</p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="bubble__content">{displayText}</p>
                    )}
                    {msg.refs ? (
                      <div className="refs">
                        <div className="refs__title">REFERENCES</div>
                        <div className="refs__list">
                          {msg.refs.filter(isRefVisible).map((ref) => (
                            <button
                              type="button"
                              key={ref.id}
                              className="ref"
                              onClick={() => handleRefClick(ref.id)}
                              onMouseEnter={(event) => {
                                ensureRefPreview(ref.id, ref.documentId);
                                showRefTooltip(
                                  event,
                                  ref.id,
                                  ref.documentId,
                                  ref.label ?? ""
                                );
                              }}
                              onMouseMove={(event) =>
                                showRefTooltip(
                                  event,
                                  ref.id,
                                  ref.documentId,
                                  ref.label ?? ""
                                )
                              }
                              onMouseLeave={handleRefButtonLeave}
                            >
                              <span className="ref__icon" aria-hidden="true">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                  <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                                  <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                                  <path d="M3 6l0 13" />
                                  <path d="M12 6l0 13" />
                                  <path d="M21 6l0 13" />
                                </svg>
                              </span>
                              <span className="ref__label">{ref.label}</span>
                            </button>
                          ))}
                        </div>
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
                  {chatSending ? (
                    "■"
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M10 14l11 -11" />
                      <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                    </svg>
                  )}
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
