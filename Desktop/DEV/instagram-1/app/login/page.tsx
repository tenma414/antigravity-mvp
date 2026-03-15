"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "login") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("メールアドレスまたはパスワードが正しくありません");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } else {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        if (signupError.message.includes("already registered")) {
          setError("このメールアドレスはすでに登録されています");
        } else if (signupError.message.includes("Password")) {
          setError("パスワードは6文字以上で入力してください");
        } else {
          setError("登録に失敗しました。もう一度お試しください");
        }
        setLoading(false);
        return;
      }

      setMessage(
        "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。"
      );
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center bg-white px-8">
      {/* Logo */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold italic tracking-tight text-gray-900">
          Photogram
        </h1>
      </div>

      {/* Tab Toggle */}
      <div className="mb-6 flex w-full rounded-lg border border-gray-200 p-1">
        <button
          type="button"
          onClick={() => switchMode("login")}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            isLogin
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            !isLogin
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          新規登録
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isLogin ? "パスワード" : "パスワード（6文字以上）"}
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading
            ? isLogin
              ? "ログイン中..."
              : "登録中..."
            : isLogin
              ? "ログイン"
              : "アカウントを作成"}
        </button>
      </form>
    </div>
  );
}
