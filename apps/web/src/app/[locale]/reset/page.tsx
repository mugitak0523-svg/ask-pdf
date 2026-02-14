"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError("認証リンクが無効です。再度リセットを行ってください。");
      } else {
        setReady(true);
      }
    });
  }, []);

  const handleUpdate = async () => {
    setError(null);
    setNotice(null);
    if (!ready) return;
    if (!password || password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません。");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
    } else {
      setNotice("パスワードを更新しました。ログインしてください。");
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
        <h1>パスワード再設定</h1>
        <label className="field">
          <span>New password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            disabled={!ready || loading}
          />
        </label>
        <label className="field">
          <span>Confirm</span>
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="••••••••"
            disabled={!ready || loading}
          />
        </label>
        {notice ? <p className="auth-notice">{notice}</p> : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="primary" type="button" onClick={handleUpdate} disabled={!ready || loading}>
          更新
        </button>
        <p className="auth-alt">
          <Link href="/login">サインイン</Link>
        </p>
      </div>
    </main>
  );
}
