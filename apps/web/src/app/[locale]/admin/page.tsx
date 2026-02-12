"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { supabase } from "@/lib/supabase";

type AdminUser = {
  id: string;
  email: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  plan: string | null;
  stripeStatus: string | null;
  currentPeriodEnd: string | null;
  unreadMessages: number;
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

type FeedbackItem = {
  id: string;
  userId: string;
  category: string;
  message: string;
  createdAt: string | null;
  readAt: string | null;
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type AdminPageProps = {
  initialSection?: string | null;
};

const normalizeSection = (value?: string | null) => {
  if (value === "announcements") return "announcements";
  if (value === "feedback") return "feedback";
  return "users";
};

const AdminPage = ({ initialSection }: AdminPageProps) => {
  const t = useTranslations("app");
  const locale = useLocale();
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "ok" | "denied">("checking");
  const [adminSection, setAdminSection] = useState<
    "users" | "announcements" | "feedback"
  >(() => normalizeSection(initialSection));
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string | null>(null);
  const [adminUserDetail, setAdminUserDetail] = useState<AdminUserDetail | null>(null);
  const [adminMessages, setAdminMessages] = useState<SupportMessage[]>([]);
  const [adminUsageDaily, setAdminUsageDaily] = useState<UsageDailyPoint[]>([]);
  const [adminMessageDraft, setAdminMessageDraft] = useState("");
  const [adminMessageBusy, setAdminMessageBusy] = useState(false);
  const [adminUnreadTotal, setAdminUnreadTotal] = useState(0);
  const [adminFeedbackUnreadTotal, setAdminFeedbackUnreadTotal] = useState(0);
  const [adminAnnouncements, setAdminAnnouncements] = useState<AdminAnnouncement[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<FeedbackItem[]>([]);
  const [adminAnnouncementDraft, setAdminAnnouncementDraft] = useState({
    title: "",
    body: "",
  });
  const [adminAnnouncementBusy, setAdminAnnouncementBusy] = useState(false);

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
      const response = await fetch(`${baseUrl}/admin/users`, { headers });
      if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
      const payload = await response.json();
      const items = Array.isArray(payload?.users) ? payload.users : [];
      const normalized = items.map((item: any) => ({
        id: String(item?.id ?? ""),
        email: item?.email ?? null,
        createdAt: item?.created_at ?? null,
        lastSignInAt: item?.last_sign_in_at ?? null,
        plan: item?.plan ?? null,
        stripeStatus: item?.stripe_status ?? null,
        currentPeriodEnd: item?.current_period_end ?? null,
        unreadMessages: Number(item?.unread_message_count ?? 0),
      }));
      setAdminUsers(normalized);
      await loadUnreadTotal();
      if (!adminSelectedUserId && normalized.length > 0) {
        setAdminSelectedUserId(normalized[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users";
      setAdminUsersError(message);
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadUserDetail = async (targetUserId: string) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const response = await fetch(`${baseUrl}/admin/users/${targetUserId}`, { headers });
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
      email: item?.email ?? null,
      createdAt: item?.created_at ?? null,
      lastSignInAt: item?.last_sign_in_at ?? null,
      plan: item?.plan ?? null,
      stripeStatus: item?.stripe_status ?? null,
      stripeCustomerId: item?.stripe_customer_id ?? null,
      stripePriceId: item?.stripe_price_id ?? null,
      currentPeriodEnd: item?.current_period_end ?? null,
      documentCount: Number(item?.documentCount ?? 0),
      chatCount: Number(item?.chatCount ?? 0),
      messageCount: Number(item?.messageCount ?? 0),
      totalTokens: Number(item?.totalTokens ?? 0),
    });
    const usage = Array.isArray(payload?.usageDaily) ? payload.usageDaily : [];
    setAdminUsageDaily(
      usage.map((point: any) => ({
        day: point?.day ?? null,
        total_tokens: Number(point?.total_tokens ?? 0),
      }))
    );
  };

  const loadMessages = async (targetUserId: string) => {
    const headers = await getAuthHeaders();
    if (!headers) return;
    const url = new URL(`${baseUrl}/admin/messages`);
    url.searchParams.set("user_id", targetUserId);
    const response = await fetch(url.toString(), { headers });
    if (!response.ok) return;
    const payload = await response.json();
    const items = Array.isArray(payload?.messages) ? payload.messages : [];
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
      await loadMessages(adminSelectedUserId);
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

  const changeSection = async (section: "users" | "announcements" | "feedback") => {
    setAdminSection(section);
    await router.replace(`/admin/${section}`);
  };

  const openUserFromFeedback = (userId: string) => {
    if (!userId) return;
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
    if (authStatus !== "ok") return;
    if (adminSection === "users") {
      void loadUsers();
    }
    if (adminSection === "announcements") {
      void loadAnnouncements();
    }
    if (adminSection === "feedback") {
      void loadFeedback();
    }
    void loadUnreadTotal();
    void loadFeedbackUnreadTotal();
  }, [adminSection, authStatus]);

  useEffect(() => {
    if (!adminSelectedUserId) return;
    void loadUserDetail(adminSelectedUserId);
    void loadMessages(adminSelectedUserId);
  }, [adminSelectedUserId]);

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
          {authStatus === "ok" && adminSection === "users" ? (
            <div className="admin-console__grid">
              <section className="admin-console__panel">
                <h2>{t("adminUsersTitle")}</h2>
                <p className="admin-console__desc">{t("adminUsersDesc")}</p>
                <div className="admin-table">
                  <div className="admin-table__row admin-table__head">
                    <div>{t("adminUserId")}</div>
                    <div>{t("adminUserEmail")}</div>
                    <div>{t("adminUserPlan")}</div>
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
              </section>
              <section className="admin-console__panel">
                <h2>{t("adminUserDetailTitle")}</h2>
                {adminUserDetail ? (
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
                      <span>{formatDateTime(adminUserDetail.lastSignInAt)}</span>
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

export default AdminPage;
