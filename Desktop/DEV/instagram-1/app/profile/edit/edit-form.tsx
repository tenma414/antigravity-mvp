"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

type Props = {
  userId: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string;
};

export default function EditForm({
  userId,
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: Props) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      id: userId,
      username: username.trim() || null,
      bio: bio.trim() || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" });

    if (upsertError) {
      const message = `保存に失敗しました: ${upsertError.message}`;
      setError(message);
      setSaving(false);
      alert(message);
      return;
    }

    setSuccess(true);
    setSaving(false);

    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 800);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/profile"
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          キャンセル
        </Link>
        <h1 className="text-base font-semibold text-gray-900">
          プロフィールを編集
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:text-blue-300 disabled:cursor-not-allowed"
        >
          {saving ? "保存中..." : "完了"}
        </button>
      </header>

      {/* Avatar Preview */}
      <div className="flex flex-col items-center py-6">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="アバタープレビュー"
            className="h-24 w-24 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-3xl font-bold text-white">
            {(username[0] || "U").toUpperCase()}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="flex-1 space-y-0 border-t border-gray-200">
        {/* Username */}
        <div className="flex items-center border-b border-gray-100 px-4 py-3">
          <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-500">
            名前
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ユーザー名を入力"
            maxLength={30}
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Bio */}
        <div className="flex border-b border-gray-100 px-4 py-3">
          <label className="w-24 flex-shrink-0 pt-0.5 text-sm font-medium text-gray-500">
            自己紹介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="自己紹介を入力..."
            rows={4}
            maxLength={150}
            className="flex-1 resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Avatar URL */}
        <div className="flex items-center border-b border-gray-100 px-4 py-3">
          <label className="w-24 flex-shrink-0 text-sm font-medium text-gray-500">
            アイコンURL
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Feedback */}
        <div className="px-4 pt-3">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              プロフィールを保存しました ✓
            </p>
          )}
        </div>

        {/* Save Button */}
        <div className="px-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}
