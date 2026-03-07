"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  lastActivityAt: string | null;
  plan: string | null;
  userType: "registered" | "guest";
  stripeStatus: string | null;
  currentPeriodEnd: string | null;
  unreadMessages: number;
  documentCount: number;
  chatCount: number;
  messageCount: number;
  totalTokens: number;
};

type AdminUserDetail = AdminUser & {
  stripeCustomerId: string | null;
  stripePriceId: string | null;
  documentCount: number;
  chatCount: number;
  messageCount: number;
  totalTokens: number;
};

type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  status: string;
  createdAt: string | null;
  publishedAt: string | null;
};

type SupportMessage = {
  id: string;
  direction: "user" | "admin";
  content: string;
  createdAt: string | null;
  readAt: string | null;
};

type UsageDailyPoint = {
  day: string | null;
  total_tokens: number | null;
};

type OverviewDailyPoint = {
  day: string | null;
  signups: number;
  activeUsers: number;
  documents: number;
  messages: number;
  tokens: number;
  parsePages: number;
  tokenCostYen: number;
  parseCostYen: number;
};

type OverviewModelPoint = {
  model: string;
  calls: number;
  totalTokens: number;
  share: number;
  estimatedCostUsd: number;
};

type OverviewUserTypePoint = {
  userType: "guest" | "free" | "plus" | "deleted";
  users: number;
  share: number;
};

type OverviewPeriod = "today" | "yesterday" | "7d" | "30d" | "all";
type OverviewCurrency = "USD" | "JPY";

type AdminOverview = {
  period: {
    key: OverviewPeriod;
    startAt: string | null;
    endAt: string | null;
  };
  windowDays: number;
  rates: {
    tokenCostPer1kYen: number;
    parseCostPerPageYen: number;
    usdToJpy: number;
    usdToJpySource: string;
    usdToJpyFetchedAt: string;
    usdToJpyFallback: boolean;
  };
  summary: {
    registeredUsers: number;
    guestUsers: number;
    usersTotal: number;
    activeUsersWindow: number;
    documentsTotal: number;
    documentsWindow: number;
    messagesTotal: number;
    messagesWindow: number;
    tokensTotal: number;
    tokensWindow: number;
    parsePagesTotal: number;
    parsePagesWindow: number;
    tokenCostWindowYen: number;
    parseCostWindowYen: number;
    unreadMessages: number;
    unreadFeedback: number;
  };
  daily: OverviewDailyPoint[];
  models: OverviewModelPoint[];
  userTypes: OverviewUserTypePoint[];
};

type FeedbackItem = {
  id: string;
  userId: string;
  category: string;
  message: string;
  createdAt: string | null;
  readAt: string | null;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const normalizeSection = (value?: string | null) => {
  if (value === "overview") return "overview";
  if (value === "announcements") return "announcements";
  if (value === "feedback") return "feedback";
  return "users";
};

const AdminPageContent = () => {
  const t = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSection = normalizeSection(searchParams?.get("section"));
  const [authError, setAuthError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "ok" | "denied">("checking");
  const [adminSection, setAdminSection] = useState<
    "overview" | "users" | "announcements" | "feedback"
  >(initialSection);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersTotal, setAdminUsersTotal] = useState(0);
  const [adminUsersLimit, setAdminUsersLimit] = useState(50);
  const [adminUsersOffset, setAdminUsersOffset] = useState(0);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [adminUserQueryInput, setAdminUserQueryInput] = useState("");
  const [adminUserQuery, setAdminUserQuery] = useState("");
  const [adminUserTypeFilter, setAdminUserTypeFilter] = useState<"all" | "registered" | "guest">(
    "all"
  );
  const [adminPlanFilter, setAdminPlanFilter] = useState<"all" | "free" | "plus" | "guest">(
    "all"
  );
  const [adminStripeStatusFilter, setAdminStripeStatusFilter] = useState<
    "all" | "active" | "trialing" | "past_due" | "canceled" | "incomplete"
  >("all");
  const [adminUnreadFilter, setAdminUnreadFilter] = useState<"all" | "only" | "none">("all");
  const [adminActiveDaysFilter, setAdminActiveDaysFilter] = useState<
    "all" | "1" | "7" | "30" | "90"
  >("all");
  const [adminSortBy, setAdminSortBy] = useState<
    | "created_at"
    | "last_sign_in_at"
    | "last_activity_at"
    | "unread"
    | "tokens"
    | "documents"
    | "messages"
    | "id"
  >("created_at");
  const [adminSortDir, setAdminSortDir] = useState<"asc" | "desc">("desc");
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);
  const [adminUserDetail, setAdminUserDetail] = useState<AdminUserDetail | null>(null);
  const [adminUserDetailLoading, setAdminUserDetailLoading] = useState(false);
  const [adminMessages, setAdminMessages] = useState<SupportMessage[]>([]);
  const [adminUsageDaily, setAdminUsageDaily] = useState<UsageDailyPoint[]>([]);
  const [adminMessageDraft, setAdminMessageDraft] = useState("");
  const [adminMessageBusy, setAdminMessageBusy] = useState(false);
  const [adminUnreadTotal, setAdminUnreadTotal] = useState(0);
  const [adminFeedbackUnreadTotal, setAdminFeedbackUnreadTotal] = useState(0);
  const [adminAnnouncements, setAdminAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<FeedbackItem[]>([]);
  const [adminOverview, setAdminOverview] = useState<AdminOverview | null>(null);
  const [adminOverviewLoading, setAdminOverviewLoading] = useState(false);
  const [adminOverviewError, setAdminOverviewError] = useState<string | null>(null);
  const [adminOverviewPeriod, setAdminOverviewPeriod] = useState<OverviewPeriod>("30d");
  const [adminOverviewCurrency, setAdminOverviewCurrency] = useState<OverviewCurrency>("USD");
  const [adminAnnouncementDraft, setAdminAnnouncementDraft] = useState({
    title: "",
    body: "",
  });
  const [adminAnnouncementBusy, setAdminAnnouncementBusy] = useState(false);
  const detailRequestIdRef = useRef(0);

  useEffect(() => {
    setAdminSection(normalizeSection(searchParams?.get("section")));
  }, [searchParams]);

  const baseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
    []
  );

  const formatDate = (value: number | string | null) => {
    if (!value) return "-";
    const date = typeof value === "string" ? new Date(value) : new Date(value * 1000);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(locale);
  };

  const formatDateTime = (value: number | string | null) => {
    if (!value) return "-";
    const date = typeof value === "string" ? new Date(value) : new Date(value * 1000);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString(locale);
  };

  const usdToJpyRate = adminOverview?.rates?.usdToJpy ?? 150;

  const formatMoney = (valueUsd: number) => {
    const value =
      adminOverviewCurrency === "JPY" ? Number(valueUsd || 0) * usdToJpyRate : Number(valueUsd || 0);
    const symbol = adminOverviewCurrency === "JPY" ? "¥" : "$";
    if (!Number.isFinite(value)) return `${symbol}0`;
    if (value === 0) return `${symbol}0`;
    if (Math.abs(value) < 0.0001) return `< ${symbol}0.0001`;
    if (Math.abs(value) < 1) {
      return `${symbol}${value.toLocaleString(locale, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      })}`;
    }
    return `${symbol}${value.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
  };

  const getOverviewPeriodLabel = (key: OverviewPeriod) => {
    if (key === "today") return "今日";
    if (key === "yesterday") return "昨日";
    if (key === "7d") return "過去7日間";
    if (key === "30d") return "30日間";
    return "全期間";
  };

  const formatRelativeFromNow = (value: number | string | null) => {
    if (!value) return null;
    const date = typeof value === "string" ? new Date(value) : new Date(value * 1000);
    if (Number.isNaN(date.getTime())) return null;
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return "0日前";
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;
    const minMs = 60 * 1000;
    const days = Math.floor(diffMs / dayMs);
    if (days >= 1) return `${days}日前`;
    const hours = Math.floor(diffMs / hourMs);
    if (hours >= 1) return `${hours}時間前`;
    const mins = Math.max(1, Math.floor(diffMs / minMs));
    return `${mins}分前`;
  };

  const buildLineData = (
    label: string,
    values: number[],
    color: string,
    fillColor: string
  ) => ({
    labels: adminOverview?.daily.map((point) => formatDate(point.day)) ?? [],
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: fillColor,
        tension: 0.3,
        fill: true,
        pointRadius: 2,
      },
    ],
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAdminUserQuery(adminUserQueryInput.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [adminUserQueryInput]);

  const getAuthHeaders = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const loadAdminStatus = async () => {
    const headers = await getAuthHeaders();
    if (!headers) {
      router.replace("/login");
      return false;
    }
    const response = await fetch(`${baseUrl}/admin/me`, { headers });
    if (!response.ok) {
      setAuthError(t("adminConsoleUnauthorized"));
      setAuthStatus("denied");
      return false;
    }
    const payload = await response.json();
    if (!payload?.isAdmin) {
      setAuthError(t("adminConsoleUnauthorized"));
      setAuthStatus("denied");
      return false;
    }
    setAuthStatus("ok");
    return true;
  };

  const loadUsers = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    setAdminUsersLoading(true);
    setAdminUsersError(null);
    try {
      const url = new URL(`${baseUrl}/admin/users`);
      url.searchParams.set("limit", String(adminUsersLimit));
      url.searchParams.set("offset", String(adminUsersOffset));
      if (adminUserQuery) url.searchParams.set("q", adminUserQuery);
      if (adminUserTypeFilter !== "all") url.searchParams.set("user_type", adminUserTypeFilter);
      if (adminPlanFilter !== "all") url.searchParams.set("plan", adminPlanFilter);
      if (adminStripeStatusFilter !== "all")
        url.searchParams.set("stripe_status", adminStripeStatusFilter);
      if (adminUnreadFilter !== "all") url.searchParams.set("unread", adminUnreadFilter);
      if (adminActiveDaysFilter !== "all") url.searchParams.set("active_days", adminActiveDaysFilter);
      url.searchParams.set("sort_by", adminSortBy);
      url.searchParams.set("sort_dir", adminSortDir);
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
      const payload = await response.json();
      const items = Array.isArray(payload?.users) ? payload.users : [];
      const normalized = items.map((item: any) => ({
        id: String(item?.id ?? ""),
        email:
          item?.user_type === "guest" ? "未ログイン" : item?.email ? String(item.email) : null,
        createdAt: item?.created_at ?? null,
        lastSignInAt: item?.last_sign_in_at ?? null,
        lastActivityAt: item?.last_activity_at ?? null,
        plan:
          item?.plan && String(item.plan).trim().length > 0
            ? String(item.plan)
            : item?.user_type === "guest"
              ? "guest"
              : "free",
        userType: item?.user_type === "guest" ? "guest" : "registered",
        stripeStatus: item?.stripe_status ?? null,
        currentPeriodEnd: item?.current_period_end ?? null,
        unreadMessages: Number(item?.unread_message_count ?? 0),
        documentCount: Number(item?.document_count ?? 0),
        chatCount: Number(item?.chat_count ?? 0),
        messageCount: Number(item?.message_count ?? 0),
        totalTokens: Number(item?.total_tokens ?? 0),
      }));
      setAdminUsers(normalized);
      setAdminUsersTotal(Number(payload?.total ?? normalized.length));
      await loadUnreadTotal();
      if (normalized.length === 0) {
        setAdminSelectedUserId(null);
      } else if (!adminSelectedUserId) {
        setAdminSelectedUserId(normalized[0].id);
      } else if (!normalized.some((item: AdminUser) => item.id === adminSelectedUserId)) {
        setAdminSelectedUserId(normalized[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      setAdminUsersError(message);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadUserDetail = async (targetUserId: string, requestId: number) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/users/${targetUserId}`, { headers });
    if (requestId !== detailRequestIdRef.current) return;
    if (!response.ok) {
      setAdminUserDetail(null);
      setAdminUsageDaily([]);
      return;
    }
    const payload = await response.json();
    const item = payload?.user ?? null;
    if (!item) {
      setAdminUserDetail(null);
      setAdminUsageDaily([]);
      return;
    }
    setAdminUserDetail({
      id: String(item?.id ?? ""),
      email:
        item?.user_type === "guest" ? "未ログイン" : item?.email ? String(item.email) : null,
      createdAt: item?.created_at ?? null,
      lastSignInAt: item?.last_sign_in_at ?? null,
      lastActivityAt: item?.last_activity_at ?? null,
      plan:
        item?.plan && String(item.plan).trim().length > 0
          ? String(item.plan)
          : item?.user_type === "guest"
            ? "guest"
            : "free",
      userType: item?.user_type === "guest" ? "guest" : "registered",
      stripeStatus: item?.stripe_status ?? null,
      stripeCustomerId: item?.stripe_customer_id ?? null,
      stripePriceId: item?.stripe_price_id ?? null,
      currentPeriodEnd: item?.current_period_end ?? null,
      unreadMessages: Number(item?.unread_message_count ?? 0),
      documentCount: Number(item?.documentCount ?? 0),
      chatCount: Number(item?.chatCount ?? 0),
      messageCount: Number(item?.messageCount ?? 0),
      totalTokens: Number(item?.totalTokens ?? 0),
    });
    const usage = Array.isArray(payload?.usageDaily) ? payload.usageDaily : [];
    if (requestId !== detailRequestIdRef.current) return;
    setAdminUsageDaily(
      usage.map((point: any) => ({
        day: point?.day ?? null,
        total_tokens: Number(point?.total_tokens ?? 0),
      }))
    );
  };

  const loadMessages = async (targetUserId: string, requestId: number) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const url = new URL(`${baseUrl}/admin/messages`);
    url.searchParams.set("user_id", targetUserId);
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload?.messages) ? payload.messages : [];
    if (requestId !== detailRequestIdRef.current) return;
    setAdminMessages(
      items.map((item: any) => ({
        id: String(item?.id ?? ""),
        direction: item?.direction === "admin" ? "admin" : "user",
        content: String(item?.content ?? ""),
        createdAt: item?.created_at ?? null,
        readAt: item?.read_at ?? null,
      }))
    );
  };

  const loadSelectedUser = async (targetUserId: string) => {
    const requestId = detailRequestIdRef.current + 1;
    detailRequestIdRef.current = requestId;
    setAdminUserDetailLoading(true);
    setAdminUserDetail(null);
    setAdminUsageDaily([]);
    setAdminMessages([]);
    await Promise.all([loadUserDetail(targetUserId, requestId), loadMessages(targetUserId, requestId)]);
    if (requestId === detailRequestIdRef.current) {
      setAdminUserDetailLoading(false);
    }
  };

  const loadOverview = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    setAdminOverviewLoading(true);
    setAdminOverviewError(null);
    try {
      const response = await fetch(`${baseUrl}/admin/overview?period=${adminOverviewPeriod}`, {
        headers,
      });
      if (!response.ok) throw new Error(`Failed to load overview (${response.status})`);
      const payload = await response.json();
      const summary = payload?.summary ?? {};
      const dailySource = Array.isArray(payload?.daily) ? payload.daily : [];
      const modelsSource = Array.isArray(payload?.models) ? payload.models : [];
      const userTypesSource = Array.isArray(payload?.userTypes) ? payload.userTypes : [];
      const periodKey = String(payload?.period?.key ?? adminOverviewPeriod).toLowerCase();
      const normalizedPeriod: OverviewPeriod = (
        ["today", "yesterday", "7d", "30d", "all"].includes(periodKey) ? periodKey : "30d"
      ) as OverviewPeriod;
      setAdminOverview({
        period: {
          key: normalizedPeriod,
          startAt: payload?.period?.startAt ?? null,
          endAt: payload?.period?.endAt ?? null,
        },
        windowDays: Number(payload?.windowDays ?? 60),
        rates: {
          tokenCostPer1kYen: Number(payload?.rates?.tokenCostPer1kYen ?? 0),
          parseCostPerPageYen: Number(payload?.rates?.parseCostPerPageYen ?? 0),
          usdToJpy: Number(payload?.rates?.usdToJpy ?? 150),
          usdToJpySource: String(payload?.rates?.usdToJpySource ?? ""),
          usdToJpyFetchedAt: String(payload?.rates?.usdToJpyFetchedAt ?? ""),
          usdToJpyFallback: Boolean(payload?.rates?.usdToJpyFallback ?? false),
        },
        summary: {
          registeredUsers: Number(summary?.registeredUsers ?? 0),
          guestUsers: Number(summary?.guestUsers ?? 0),
          usersTotal: Number(summary?.usersTotal ?? 0),
          activeUsersWindow: Number(summary?.activeUsersWindow ?? 0),
          documentsTotal: Number(summary?.documentsTotal ?? 0),
          documentsWindow: Number(summary?.documentsWindow ?? 0),
          messagesTotal: Number(summary?.messagesTotal ?? 0),
          messagesWindow: Number(summary?.messagesWindow ?? 0),
          tokensTotal: Number(summary?.tokensTotal ?? 0),
          tokensWindow: Number(summary?.tokensWindow ?? 0),
          parsePagesTotal: Number(summary?.parsePagesTotal ?? 0),
          parsePagesWindow: Number(summary?.parsePagesWindow ?? 0),
          tokenCostWindowYen: Number(summary?.tokenCostWindowYen ?? 0),
          parseCostWindowYen: Number(summary?.parseCostWindowYen ?? 0),
          unreadMessages: Number(summary?.unreadMessages ?? 0),
          unreadFeedback: Number(summary?.unreadFeedback ?? 0),
        },
        daily: dailySource.map((item: any) => ({
          day: item?.day ?? null,
          signups: Number(item?.signups ?? 0),
          activeUsers: Number(item?.active_users ?? 0),
          documents: Number(item?.documents ?? 0),
          messages: Number(item?.messages ?? 0),
          tokens: Number(item?.tokens ?? 0),
          parsePages: Number(item?.parse_pages ?? 0),
          tokenCostYen: Number(item?.token_cost_yen ?? 0),
          parseCostYen: Number(item?.parse_cost_yen ?? 0),
        })),
        models: modelsSource.map((item: any) => ({
          model: String(item?.model ?? "unknown"),
          calls: Number(item?.calls ?? 0),
          totalTokens: Number(item?.total_tokens ?? 0),
          share: Number(item?.share ?? 0),
          estimatedCostUsd: Number(item?.estimated_cost_usd ?? 0),
        })),
        userTypes: userTypesSource.map((item: any) => ({
          userType: (String(item?.user_type ?? "guest").toLowerCase() as
            | "guest"
            | "free"
            | "plus"
            | "deleted"),
          users: Number(item?.users ?? 0),
          share: Number(item?.share ?? 0),
        })),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load overview";
      setAdminOverviewError(message);
    } finally {
      setAdminOverviewLoading(false);
    }
  };

  const usageChartData = useMemo(() => {
    const labels = adminUsageDaily.map((point) => formatDate(point.day));
    const values = adminUsageDaily.map((point) => point.total_tokens ?? 0);
    return {
      labels,
      datasets: [
        {
          label: t("adminUserTokensChart"),
          data: values,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79, 70, 229, 0.12)",
          tension: 0.3,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [adminUsageDaily, t, locale]);

  const usageChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false, mode: "index" as const },
      },
      scales: {
        x: {
          ticks: { maxTicksLimit: 6, color: "#667085", font: { size: 10 } },
          grid: { display: false },
        },
        y: {
          ticks: { color: "#667085", font: { size: 10 } },
          grid: { color: "rgba(148, 163, 184, 0.2)" },
        },
      },
    }),
    []
  );

  const overviewSignupData = useMemo(
    () =>
      buildLineData(
        "登録ユーザー",
        adminOverview?.daily.map((point) => point.signups) ?? [],
        "#4f46e5",
        "rgba(79, 70, 229, 0.12)"
      ),
    [adminOverview]
  );
  const overviewActiveData = useMemo(
    () =>
      buildLineData(
        "アクティブユーザー",
        adminOverview?.daily.map((point) => point.activeUsers) ?? [],
        "#0ea5e9",
        "rgba(14, 165, 233, 0.12)"
      ),
    [adminOverview]
  );
  const overviewTokenData = useMemo(
    () =>
      buildLineData(
        "トークン使用量",
        adminOverview?.daily.map((point) => point.tokens) ?? [],
        "#16a34a",
        "rgba(22, 163, 74, 0.12)"
      ),
    [adminOverview]
  );
  const overviewTokenCostData = useMemo(
    () =>
      buildLineData(
        "推定LLM料金(USD)",
        adminOverview?.daily.map((point) => point.tokenCostYen) ?? [],
        "#65a30d",
        "rgba(132, 204, 22, 0.12)"
      ),
    [adminOverview]
  );
  const overviewDocData = useMemo(
    () =>
      buildLineData(
        "PDFアップロード数",
        adminOverview?.daily.map((point) => point.documents) ?? [],
        "#d97706",
        "rgba(245, 158, 11, 0.12)"
      ),
    [adminOverview]
  );
  const overviewParseData = useMemo(
    () =>
      buildLineData(
        "解析ページ数",
        adminOverview?.daily.map((point) => point.parsePages) ?? [],
        "#ea580c",
        "rgba(249, 115, 22, 0.12)"
      ),
    [adminOverview]
  );
  const overviewParseCostData = useMemo(
    () =>
      buildLineData(
        "推定解析料金(USD)",
        adminOverview?.daily.map((point) => point.parseCostYen) ?? [],
        "#dc2626",
        "rgba(239, 68, 68, 0.12)"
      ),
    [adminOverview]
  );
  const overviewMessagesData = useMemo(
    () =>
      buildLineData(
        "メッセージ数",
        adminOverview?.daily.map((point) => point.messages) ?? [],
        "#2563eb",
        "rgba(37, 99, 235, 0.12)"
      ),
    [adminOverview]
  );

  const sendMessage = async () => {
    if (!adminSelectedUserId || !adminMessageDraft.trim()) return;
    setAdminMessageBusy(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const response = await fetch(`${baseUrl}/admin/messages`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: adminSelectedUserId,
          content: adminMessageDraft.trim(),
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      setAdminMessageDraft("");
      await loadMessages(adminSelectedUserId, detailRequestIdRef.current);
    } finally {
      setAdminMessageBusy(false);
    }
  };

  const loadAnnouncements = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/announcements`, { headers });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload?.announcements) ? payload.announcements : [];
    setAdminAnnouncements(
      items.map((item: any) => ({
        id: String(item?.id ?? ""),
        title: String(item?.title ?? ""),
        body: String(item?.body ?? ""),
        status: String(item?.status ?? "draft"),
        createdAt: item?.created_at ?? null,
        publishedAt: item?.published_at ?? null,
      }))
    );
  };

  const loadFeedback = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/feedback`, { headers });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload?.feedback) ? payload.feedback : [];
    setAdminFeedback(
      items.map((item: any) => ({
        id: String(item?.id ?? ""),
        userId: String(item?.user_id ?? ""),
        category: String(item?.category ?? ""),
        message: String(item?.message ?? ""),
        createdAt: item?.created_at ?? null,
        readAt: item?.read_at ?? null,
      }))
    );
  };

  const loadUnreadTotal = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/messages/unread`, { headers });
    if (!response.ok) return;
    const payload = await response.json();
    setAdminUnreadTotal(Number(payload?.count ?? 0));
  };

  const loadFeedbackUnreadTotal = async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/feedback/unread`, { headers });
    if (!response.ok) return;
    const payload = await response.json();
    setAdminFeedbackUnreadTotal(Number(payload?.count ?? 0));
  };

  const setMessageRead = async (messageId: string, read: boolean) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const current = adminMessages.find((msg) => msg.id === messageId);
    const wasRead = Boolean(current?.readAt);
    const isUserMessage = current?.direction === "user";
    if (wasRead === read) return;
    const nextReadAt = read ? new Date().toISOString() : null;
    setAdminMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, readAt: nextReadAt } : msg))
    );
    if (isUserMessage && adminSelectedUserId) {
      setAdminUsers((prev) =>
        prev.map((item) =>
          item.id === adminSelectedUserId
            ? {
                ...item,
                unreadMessages: Math.max(
                  0,
                  (item.unreadMessages || 0) + (read ? -1 : 1)
                ),
              }
            : item
        )
      );
      setAdminUnreadTotal((prev) => Math.max(0, prev + (read ? -1 : 1)));
    }
    await fetch(`${baseUrl}/admin/messages/${messageId}/read`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ read }),
    });
    await loadUnreadTotal();
  };

  const setFeedbackRead = async (feedbackId: string, read: boolean) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    setAdminFeedback((prev) =>
      prev.map((item) =>
        item.id === feedbackId ? { ...item, readAt: read ? new Date().toISOString() : null } : item
      )
    );
    await fetch(`${baseUrl}/admin/feedback/${feedbackId}/read`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ read }),
    });
    await loadFeedbackUnreadTotal();
  };

  const changeSection = async (section: "overview" | "users" | "announcements" | "feedback") => {
    setAdminSection(section);
    await router.replace(`/admin/${section}`);
  };

  const openUserFromFeedback = (userId: string) => {
    if (!userId) return;
    setAdminUsersOffset(0);
    setAdminUserQueryInput("");
    setAdminUserQuery("");
    setAdminUserTypeFilter("all");
    setAdminPlanFilter("all");
    setAdminStripeStatusFilter("all");
    setAdminUnreadFilter("all");
    setAdminActiveDaysFilter("all");
    setAdminSelectedUserId(userId);
    void changeSection("users");
  };

  const publishAnnouncement = async () => {
    if (!adminAnnouncementDraft.title.trim() || !adminAnnouncementDraft.body.trim()) return;
    setAdminAnnouncementBusy(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const response = await fetch(`${baseUrl}/admin/announcements`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: adminAnnouncementDraft.title.trim(),
          body: adminAnnouncementDraft.body.trim(),
          publish: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to publish announcement");
      setAdminAnnouncementDraft({ title: "", body: "" });
      await loadAnnouncements();
    } finally {
      setAdminAnnouncementBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    const boot = async () => {
      const ok = await loadAdminStatus();
      if (!active) return;
      if (ok) {
        await loadUnreadTotal();
        await loadFeedbackUnreadTotal();
      }
    };
    void boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setAdminSection(normalizeSection(initialSection));
  }, [initialSection]);

  useEffect(() => {
    if (initialSection) return;
    void router.replace("/admin/users");
  }, [initialSection, router]);

  useEffect(() => {
    if (authStatus !== "ok" || adminSection !== "users") return;
    void loadUsers();
    void loadFeedbackUnreadTotal();
  }, [
    adminSection,
    authStatus,
    adminUsersLimit,
    adminUsersOffset,
    adminUserQuery,
    adminUserTypeFilter,
    adminPlanFilter,
    adminStripeStatusFilter,
    adminUnreadFilter,
    adminActiveDaysFilter,
    adminSortBy,
    adminSortDir,
  ]);

  useEffect(() => {
    if (authStatus !== "ok" || adminSection !== "overview") return;
    void loadOverview();
    void loadUnreadTotal();
    void loadFeedbackUnreadTotal();
  }, [adminSection, authStatus, adminOverviewPeriod]);

  useEffect(() => {
    if (authStatus !== "ok" || adminSection !== "announcements") return;
    void loadAnnouncements();
    void loadUnreadTotal();
    void loadFeedbackUnreadTotal();
  }, [adminSection, authStatus]);

  useEffect(() => {
    if (authStatus !== "ok" || adminSection !== "feedback") return;
    void loadFeedback();
    void loadUnreadTotal();
    void loadFeedbackUnreadTotal();
  }, [adminSection, authStatus]);

  useEffect(() => {
    if (!adminSelectedUserId) return;
    void loadSelectedUser(adminSelectedUserId);
  }, [adminSelectedUserId]);

  const usersRangeStart = adminUsersTotal === 0 ? 0 : adminUsersOffset + 1;
  const usersRangeEnd = adminUsersTotal === 0
    ? 0
    : Math.min(adminUsersOffset + adminUsers.length, adminUsersTotal);

  return (
    <div className="admin-console">
      <header className="admin-console__header">
        <div>
          <div className="admin-console__brand">{t("adminConsoleTitle")}</div>
          <div className="admin-console__subtitle">{t("adminConsoleSubtitle")}</div>
        </div>
        <button
          type="button"
          className="admin-console__signout"
          onClick={() => supabase.auth.signOut()}
        >
          {t("auth.signOut")}
        </button>
      </header>
      <div className="admin-console__layout">
        <aside className="admin-console__sidebar">
          <button
            type="button"
            className={`admin-console__nav ${adminSection === "overview" ? "is-active" : ""}`}
            onClick={() => void changeSection("overview")}
          >
            <span>概要</span>
          </button>
          <button
            type="button"
            className={`admin-console__nav ${adminSection === "users" ? "is-active" : ""}`}
            onClick={() => void changeSection("users")}
          >
            <span>{t("adminNavUsers")}</span>
            {adminUnreadTotal > 0 ? (
              <span className="admin-chip admin-chip--danger">{adminUnreadTotal}</span>
            ) : null}
          </button>
          <button
            type="button"
            className={`admin-console__nav ${
              adminSection === "announcements" ? "is-active" : ""
            }`}
            onClick={() => void changeSection("announcements")}
          >
            {t("adminNavAnnouncements")}
          </button>
          <button
            type="button"
            className={`admin-console__nav ${adminSection === "feedback" ? "is-active" : ""}`}
            onClick={() => void changeSection("feedback")}
          >
            <span>{t("adminNavFeedback")}</span>
            {adminFeedbackUnreadTotal > 0 ? (
              <span className="admin-chip admin-chip--danger">
                {adminFeedbackUnreadTotal}
              </span>
            ) : null}
          </button>
        </aside>
        <main className="admin-console__content">
          {authStatus === "checking" ? (
            <div className="admin-console__panel">
              <div className="admin-console__empty">{t("common.loading")}</div>
            </div>
          ) : null}
          {authStatus === "denied" ? (
            <div className="admin-console__panel">
              <div className="admin-console__empty">{authError}</div>
            </div>
          ) : null}
          {authStatus === "ok" && adminSection === "overview" ? (
            <div className="admin-console__grid">
              <section className="admin-console__panel admin-overview">
                <h2>概要ダッシュボード</h2>
                <div className="admin-overview__toolbar">
                  <div className="admin-overview__toolbar-controls">
                    <select
                      className="settings__select admin-overview__period-select"
                      value={adminOverviewPeriod}
                      onChange={(event) =>
                        setAdminOverviewPeriod(event.target.value as OverviewPeriod)
                      }
                    >
                      <option value="today">今日</option>
                      <option value="yesterday">昨日</option>
                      <option value="7d">過去7日間</option>
                      <option value="30d">30日間</option>
                      <option value="all">全期間</option>
                    </select>
                    <select
                      className="settings__select admin-overview__currency-select"
                      value={adminOverviewCurrency}
                      onChange={(event) =>
                        setAdminOverviewCurrency(event.target.value as OverviewCurrency)
                      }
                    >
                      <option value="USD">USD</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                  {adminOverview?.period?.startAt && adminOverview?.period?.endAt ? (
                    <div className="admin-overview__period-range-wrap">
                      <div className="admin-overview__period-range">
                        {formatDate(adminOverview.period.startAt)}〜{formatDate(adminOverview.period.endAt)}
                      </div>
                      <div
                        className="admin-overview__fx-meta"
                        title={adminOverview.rates.usdToJpySource || undefined}
                      >
                        USD/JPY: {adminOverview.rates.usdToJpy.toLocaleString(locale, { maximumFractionDigits: 4 })}
                        {" · "}
                        取得: {formatDateTime(adminOverview.rates.usdToJpyFetchedAt)}
                        {adminOverview.rates.usdToJpyFallback ? " · fallback" : ""}
                      </div>
                    </div>
                  ) : null}
                </div>
                <p className="admin-console__desc">
                  {adminOverview
                    ? `${getOverviewPeriodLabel(adminOverview.period.key)}の登録・利用・コスト推移`
                    : "30日間の登録・利用・コスト推移"}
                </p>
                {adminOverviewLoading ? (
                  <div className="admin-console__empty">{t("common.loading")}</div>
                ) : adminOverviewError ? (
                  <div className="admin-console__empty">{adminOverviewError}</div>
                ) : adminOverview ? (
                  <>
                    <div className="admin-overview__stats">
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">登録者</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.registeredUsers}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">未ログイン利用者</div>
                        <div className="admin-overview__value">{adminOverview.summary.guestUsers}</div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">直近アクティブ</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.activeUsersWindow}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">トークン(直近)</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.tokensWindow.toLocaleString()}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">
                          推定LLM料金(直近, {adminOverviewCurrency})
                        </div>
                        <div className="admin-overview__value">
                          {formatMoney(adminOverview.summary.tokenCostWindowYen)}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">PDF数(直近)</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.documentsTotal.toLocaleString()}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">解析ページ(直近)</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.parsePagesWindow.toLocaleString()}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">
                          推定解析料金(直近, {adminOverviewCurrency})
                        </div>
                        <div className="admin-overview__value">
                          {formatMoney(adminOverview.summary.parseCostWindowYen)}
                        </div>
                      </div>
                      <div className="admin-overview__stat">
                        <div className="admin-overview__label">メッセージ数(直近)</div>
                        <div className="admin-overview__value">
                          {adminOverview.summary.messagesTotal.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="admin-overview__charts">
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">登録者推移</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewSignupData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">アクティブユーザー推移</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewActiveData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">トークン使用量</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewTokenData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">推定LLM料金</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewTokenCostData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">PDFアップロード数</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewDocData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">解析ページ数</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewParseData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">推定解析料金</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewParseCostData} options={usageChartOptions} />
                        </div>
                      </div>
                      <div className="admin-overview__chart">
                        <div className="admin-detail__messages-title">メッセージ推移</div>
                        <div className="admin-usage-chart">
                          <Line data={overviewMessagesData} options={usageChartOptions} />
                        </div>
                      </div>
                    </div>

                    <div className="admin-overview__models">
                      <div className="admin-detail__messages-title">モデル別トークン使用量</div>
                      {adminOverview.models.length === 0 ? (
                        <div className="admin-console__empty">データがありません</div>
                      ) : (
                        <div className="admin-overview__model-table">
                          <div className="admin-overview__model-row admin-overview__model-head">
                            <div>モデル</div>
                            <div>トークン</div>
                            <div>比率</div>
                            <div>呼び出し回数</div>
                            <div>料金({adminOverviewCurrency})</div>
                          </div>
                          {adminOverview.models.map((item) => (
                            <div key={item.model} className="admin-overview__model-row">
                              <div className="admin-table__cell admin-table__cell--mono">{item.model}</div>
                              <div>{item.totalTokens.toLocaleString()}</div>
                              <div>{(item.share * 100).toFixed(1)}%</div>
                              <div>{item.calls.toLocaleString()}</div>
                              <div>{formatMoney(item.estimatedCostUsd)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="admin-overview__user-types">
                      <div className="admin-detail__messages-title">ユーザー種別</div>
                      {adminOverview.userTypes.length === 0 ? (
                        <div className="admin-console__empty">データがありません</div>
                      ) : (
                        <div className="admin-overview__user-table">
                          <div className="admin-overview__user-row admin-overview__model-head">
                            <div>種別</div>
                            <div>人数</div>
                            <div>比率</div>
                          </div>
                          {adminOverview.userTypes.map((item) => (
                            <div key={item.userType} className="admin-overview__user-row">
                              <div className="admin-table__cell admin-table__cell--mono">
                                {item.userType}
                              </div>
                              <div>{item.users.toLocaleString()}</div>
                              <div>{(item.share * 100).toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="admin-console__empty">データがありません</div>
                )}
              </section>
            </div>
          ) : null}
          {authStatus === "ok" && adminSection === "users" ? (
            <div className="admin-console__grid">
              <section className="admin-console__panel">
                <h2>
                  {t("adminUsersTitle")} ({adminUsersTotal})
                </h2>
                <p className="admin-console__desc">{t("adminUsersDesc")}</p>
                <div className="admin-filters">
                  <input
                    className="settings__input"
                    type="text"
                    value={adminUserQueryInput}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminUserQueryInput(event.target.value);
                    }}
                    placeholder="検索（ID / メール）"
                  />
                  <select
                    className="settings__select"
                    value={adminUserTypeFilter}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminUserTypeFilter(
                        event.target.value as "all" | "registered" | "guest"
                      );
                    }}
                  >
                    <option value="all">種別: すべて</option>
                    <option value="registered">種別: 登録済み</option>
                    <option value="guest">種別: 未ログイン</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminPlanFilter}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminPlanFilter(event.target.value as "all" | "free" | "plus" | "guest");
                    }}
                  >
                    <option value="all">プラン: すべて</option>
                    <option value="guest">guest</option>
                    <option value="free">free</option>
                    <option value="plus">plus</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminStripeStatusFilter}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminStripeStatusFilter(
                        event.target.value as
                          | "all"
                          | "active"
                          | "trialing"
                          | "past_due"
                          | "canceled"
                          | "incomplete"
                      );
                    }}
                  >
                    <option value="all">決済状態: すべて</option>
                    <option value="active">active</option>
                    <option value="trialing">trialing</option>
                    <option value="past_due">past_due</option>
                    <option value="canceled">canceled</option>
                    <option value="incomplete">incomplete</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminUnreadFilter}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminUnreadFilter(event.target.value as "all" | "only" | "none");
                    }}
                  >
                    <option value="all">未読: すべて</option>
                    <option value="only">未読あり</option>
                    <option value="none">未読なし</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminActiveDaysFilter}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminActiveDaysFilter(
                        event.target.value as "all" | "1" | "7" | "30" | "90"
                      );
                    }}
                  >
                    <option value="all">最終活動: すべて</option>
                    <option value="1">1日以内</option>
                    <option value="7">7日以内</option>
                    <option value="30">30日以内</option>
                    <option value="90">90日以内</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminSortBy}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminSortBy(
                        event.target.value as
                          | "created_at"
                          | "last_sign_in_at"
                          | "last_activity_at"
                          | "unread"
                          | "tokens"
                          | "documents"
                          | "messages"
                          | "id"
                      );
                    }}
                  >
                    <option value="created_at">並び替え: 作成日</option>
                    <option value="last_sign_in_at">最終ログイン</option>
                    <option value="last_activity_at">最終活動</option>
                    <option value="unread">未読数</option>
                    <option value="tokens">トークン数</option>
                    <option value="documents">PDF数</option>
                    <option value="messages">メッセージ数</option>
                    <option value="id">ID</option>
                  </select>
                  <select
                    className="settings__select"
                    value={adminSortDir}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminSortDir(event.target.value as "asc" | "desc");
                    }}
                  >
                    <option value="desc">降順</option>
                    <option value="asc">昇順</option>
                  </select>
                  <select
                    className="settings__select"
                    value={String(adminUsersLimit)}
                    onChange={(event) => {
                      setAdminUsersOffset(0);
                      setAdminUsersLimit(Number(event.target.value));
                    }}
                  >
                    <option value="20">20件</option>
                    <option value="50">50件</option>
                    <option value="100">100件</option>
                  </select>
                </div>
                <div className="admin-table">
                  <div className="admin-table__row admin-table__head">
                    <div>{t("adminUserId")}</div>
                    <div>{t("adminUserEmail")}</div>
                    <div>{t("adminUserPlan")}</div>
                    <div>種別</div>
                    <div>トークン</div>
                    <div>{t("adminUnread")}</div>
                  </div>
                  {adminUsersLoading ? (
                    <div className="admin-console__empty">{t("common.loading")}</div>
                  ) : adminUsersError ? (
                    <div className="admin-console__empty">{adminUsersError}</div>
                  ) : adminUsers.length === 0 ? (
                    <div className="admin-console__empty">{t("adminUsersEmpty")}</div>
                  ) : (
                    adminUsers.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`admin-table__row admin-table__row--button ${
                          adminSelectedUserId === item.id ? "is-active" : ""
                        }`}
                        onClick={() => setAdminSelectedUserId(item.id)}
                      >
                        <div className="admin-table__cell admin-table__cell--mono">{item.id}</div>
                        <div className="admin-table__cell">{item.email ?? "-"}</div>
                        <div className="admin-table__cell">{item.plan ?? "-"}</div>
                        <div className="admin-table__cell">{item.userType}</div>
                        <div className="admin-table__cell">{item.totalTokens.toLocaleString()}</div>
                        <div className="admin-table__cell">
                          {item.unreadMessages > 0 ? (
                            <span className="admin-chip admin-chip--danger">
                              {item.unreadMessages}
                            </span>
                          ) : (
                            "-"
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="admin-pagination">
                  <button
                    type="button"
                    className="settings__btn settings__btn--ghost"
                    onClick={() => setAdminUsersOffset((prev) => Math.max(0, prev - adminUsersLimit))}
                    disabled={adminUsersOffset === 0}
                  >
                    前へ
                  </button>
                  <div className="admin-console__desc">
                    {usersRangeStart}-{usersRangeEnd} / {adminUsersTotal}
                  </div>
                  <button
                    type="button"
                    className="settings__btn settings__btn--ghost"
                    onClick={() => setAdminUsersOffset((prev) => prev + adminUsersLimit)}
                    disabled={adminUsersOffset + adminUsers.length >= adminUsersTotal}
                  >
                    次へ
                  </button>
                </div>
              </section>
              <section className="admin-console__panel">
                <h2>{t("adminUserDetailTitle")}</h2>
                {adminUserDetailLoading ? (
                  <div className="admin-console__empty">{t("common.loading")}...</div>
                ) : adminUserDetail ? (
                  <div className="admin-detail">
                    <div className="admin-detail__row">
                      <span>{t("adminUserId")}</span>
                      <span className="admin-detail__mono">{adminUserDetail.id}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserEmail")}</span>
                      <span>{adminUserDetail.email ?? "-"}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserCreated")}</span>
                      <span>{formatDateTime(adminUserDetail.createdAt)}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserLastSignIn")}</span>
                      <span>
                        {formatDateTime(adminUserDetail.lastSignInAt)}
                        {formatRelativeFromNow(adminUserDetail.lastSignInAt)
                          ? ` (${formatRelativeFromNow(adminUserDetail.lastSignInAt)})`
                          : ""}
                      </span>
                    </div>
                    <div className="admin-detail__row">
                      <span>ユーザー種別</span>
                      <span>{adminUserDetail.userType}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>最終活動</span>
                      <span>
                        {formatDateTime(adminUserDetail.lastActivityAt)}
                        {formatRelativeFromNow(adminUserDetail.lastActivityAt)
                          ? ` (${formatRelativeFromNow(adminUserDetail.lastActivityAt)})`
                          : ""}
                      </span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserPlan")}</span>
                      <span>{adminUserDetail.plan ?? "-"}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserStatus")}</span>
                      <span>{adminUserDetail.stripeStatus ?? "-"}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserCustomerId")}</span>
                      <span className="admin-detail__mono">
                        {adminUserDetail.stripeCustomerId ?? "-"}
                      </span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserPeriodEnd")}</span>
                      <span>{formatDate(adminUserDetail.currentPeriodEnd)}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserTokens")}</span>
                      <span>{adminUserDetail.totalTokens}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserDocs")}</span>
                      <span>{adminUserDetail.documentCount}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserChats")}</span>
                      <span>{adminUserDetail.chatCount}</span>
                    </div>
                    <div className="admin-detail__row">
                      <span>{t("adminUserMessages")}</span>
                      <span>{adminUserDetail.messageCount}</span>
                    </div>
                    <div className="admin-detail__messages">
                      <div className="admin-detail__messages-title">
                        {t("adminUserTokensChart")}
                      </div>
                      {adminUsageDaily.length === 0 ? (
                        <div className="admin-console__empty">
                          {t("adminUserTokensEmpty")}
                        </div>
                      ) : (
                        <div className="admin-usage-chart">
                          <Line data={usageChartData} options={usageChartOptions} />
                        </div>
                      )}
                    </div>
                    <div className="admin-detail__messages">
                      <div className="admin-detail__messages-title">
                        {t("adminUserMessagesTitle")}
                      </div>
                      {adminMessages.length === 0 ? (
                        <div className="admin-console__empty">
                          {t("adminUserMessagesEmpty")}
                        </div>
                      ) : (
                        <div className="support-thread admin-thread admin-thread--compact">
                          {adminMessages
                            .slice()
                            .sort((a, b) => {
                              const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                              const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                              return aTime - bTime;
                            })
                            .slice(-6)
                            .map((msg) => (
                              <div
                                key={msg.id}
                                className={`support-thread__item support-thread__item--${msg.direction}`}
                              >
                                <div className="support-thread__bubble-row">
                                  <div className="support-thread__bubble">{msg.content}</div>
                                  {msg.direction === "user" ? (
                                    <label className="admin-read-toggle">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(msg.readAt)}
                                        onChange={(event) =>
                                          void setMessageRead(msg.id, event.target.checked)
                                        }
                                      />
                                      <span>{t("adminReadLabel")}</span>
                                    </label>
                                  ) : null}
                                </div>
                                <div className="support-thread__meta">{formatDateTime(msg.createdAt)}</div>
                              </div>
                            ))}
                        </div>
                      )}
                      <div className="support-form">
                        <textarea
                          className="support-form__input"
                          rows={3}
                          value={adminMessageDraft}
                          onChange={(event) => setAdminMessageDraft(event.target.value)}
                          placeholder={t("adminMessagePlaceholder")}
                        />
                        <button
                          type="button"
                          className="settings__btn"
                          onClick={() => void sendMessage()}
                          disabled={
                            adminMessageBusy || adminMessageDraft.trim().length === 0
                          }
                        >
                          {adminMessageBusy ? t("common.sending") : t("adminSendMessage")}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="admin-console__empty">{t("adminSelectUser")}</div>
                )}
              </section>
            </div>
          ) : null}

          {authStatus === "ok" && adminSection === "announcements" ? (
            <div className="admin-console__panel">
              <h2>{t("adminAnnouncementsTitle")}</h2>
              <p className="admin-console__desc">{t("adminAnnouncementsDesc")}</p>
              <div className="admin-announcement-form">
                <input
                  className="settings__input"
                  type="text"
                  value={adminAnnouncementDraft.title}
                  onChange={(event) =>
                    setAdminAnnouncementDraft((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder={t("adminAnnouncementTitle")}
                />
                <textarea
                  className="support-form__input"
                  rows={4}
                  value={adminAnnouncementDraft.body}
                  onChange={(event) =>
                    setAdminAnnouncementDraft((prev) => ({ ...prev, body: event.target.value }))
                  }
                  placeholder={t("adminAnnouncementBody")}
                />
                <button
                  type="button"
                  className="settings__btn"
                  onClick={() => void publishAnnouncement()}
                  disabled={
                    adminAnnouncementBusy ||
                    adminAnnouncementDraft.title.trim().length === 0 ||
                    adminAnnouncementDraft.body.trim().length === 0
                  }
                >
                  {adminAnnouncementBusy ? t("common.sending") : t("adminAnnouncementSend")}
                </button>
              </div>
              <div className="admin-announcement-list">
                {adminAnnouncements.length === 0 ? (
                  <div className="admin-console__empty">{t("adminAnnouncementsEmpty")}</div>
                ) : (
                  adminAnnouncements.map((item) => (
                    <div key={item.id} className="announcement-card">
                      <div className="announcement-card__title">{item.title}</div>
                      <div className="announcement-card__meta">
                        {item.status.toUpperCase()} · {formatDate(item.publishedAt || item.createdAt)}
                      </div>
                      <div className="announcement-card__body">{item.body}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {authStatus === "ok" && adminSection === "feedback" ? (
            <div className="admin-console__panel">
              <h2>{t("adminFeedbackTitle")}</h2>
              <p className="admin-console__desc">{t("adminFeedbackDesc")}</p>
              {adminFeedback.length === 0 ? (
                <div className="admin-console__empty">{t("adminFeedbackEmpty")}</div>
              ) : (
                <div className="admin-feedback-list">
                  {adminFeedback.map((item) => (
                    <div key={item.id} className="admin-feedback-card">
                      <div className="admin-feedback-card__meta">
                        <button
                          type="button"
                          className="admin-feedback-card__user"
                          onClick={() => openUserFromFeedback(item.userId)}
                        >
                          {item.userId}
                        </button>
                        <span>{formatDateTime(item.createdAt)}</span>
                      </div>
                      <div className="admin-feedback-card__category">{item.category}</div>
                      <div className="admin-feedback-card__message">{item.message}</div>
                      <label className="admin-read-toggle admin-read-toggle--row">
                        <input
                          type="checkbox"
                          checked={Boolean(item.readAt)}
                          onChange={(event) =>
                            void setFeedbackRead(item.id, event.target.checked)
                          }
                        />
                        <span>{t("adminReadLabel")}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
};

const AdminPage = () => (
  <Suspense fallback={null}>
    <AdminPageContent />
  </Suspense>
);

export default AdminPage;
