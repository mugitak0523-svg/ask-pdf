"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else {
      router.replace("/");
      router.refresh();
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError("メールアドレスを入力してください。");
      return;
    }
    setLoading(true);
    const redirectTo = `${window.location.origin}/reset`;
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    if (authError) {
      setError(authError.message);
    } else {
      setNotice("パスワードリセットのメールを送信しました。メールをご確認ください。");
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="logo" aria-hidden="true">
            <img className="logo__icon" src="/icon.svg" alt="" />
          </span>
          <span className="brand">AskPDF</span>
        </div>
        <h1>サインイン</h1>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </label>
        {notice ? <p className="auth-notice">{notice}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="primary" type="button" onClick={handleSignIn} disabled={loading}>
          ログイン
        </button>
        <button className="ghost" type="button" onClick={handleResetPassword} disabled={loading}>
          パスワードを忘れた場合
        </button>
        <button className="ghost oauth" type="button" onClick={handleGoogle} disabled={loading}>
          <span className="g-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.2 3.62l6.86-6.86C35.8 2.38 30.2 0 24 0 14.64 0 6.4 5.38 2.54 13.22l7.98 6.2C12.5 13.4 17.8 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.5 24c0-1.64-.15-3.2-.44-4.73H24v9.01h12.7c-.55 2.98-2.22 5.5-4.74 7.18l7.65 5.94C43.93 37.16 46.5 31.03 46.5 24z"
              />
              <path
                fill="#FBBC05"
                d="M10.52 28.42A14.99 14.99 0 019 24c0-1.53.26-3.01.73-4.42l-7.98-6.2A23.9 23.9 0 000 24c0 3.88.93 7.56 2.58 10.8l7.94-6.38z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.2 0 11.4-2.05 15.2-5.57l-7.65-5.94c-2.13 1.43-4.86 2.28-7.55 2.28-6.2 0-11.5-3.9-13.48-9.35l-7.94 6.38C6.4 42.62 14.64 48 24 48z"
              />
            </svg>
          </span>
          Googleで続行
        </button>
        <p className="auth-alt">
          アカウントが無い場合は <Link href="/signup">新規登録</Link>
        </p>
      </div>
    </main>
  );
}
