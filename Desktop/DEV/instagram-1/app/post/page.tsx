"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";

export default function PostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!imageFile) {
      setError("画像を選択してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        throw new Error(`画像のアップロードに失敗しました: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase.from("posts").insert({
        content: content.trim() || null,
        image_url: imageUrl,
        likes: 0,
        user_id: user?.id ?? null,
      });

      if (insertError) {
        throw new Error(`投稿の保存に失敗しました: ${insertError.message}`);
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          キャンセル
        </Link>
        <h1 className="text-base font-semibold text-gray-900">新規投稿</h1>
        <button
          onClick={handleSubmit}
          disabled={!imageFile || submitting}
          className="text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:text-blue-300 disabled:cursor-not-allowed"
        >
          {submitting ? "投稿中..." : "シェア"}
        </button>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
        {/* Image Selection Area */}
        <div className="p-4">
          {previewUrl ? (
            <div className="relative">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="プレビュー"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors"
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-3 text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm font-medium text-gray-500">
                画像を選択
              </span>
              <span className="mt-1 text-xs text-gray-400">
                タップして写真を追加
              </span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Caption Input */}
        <div className="border-t border-gray-200 px-4 py-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="キャプションを入力..."
            rows={4}
            className="w-full resize-none text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit Button (Mobile) */}
        <div className="border-t border-gray-200 p-4">
          <button
            type="submit"
            disabled={!imageFile || submitting}
            className="w-full rounded-lg bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>
    </div>
  );
}
