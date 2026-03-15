"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import {
  HomeIcon,
  SearchIcon,
  PlusSquareIcon,
  UserIcon,
} from "@/app/icons";

type Post = {
  id: string;
  image_url: string;
  content: string | null;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      setPosts([]);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, image_url, content")
        .ilike("content", `%${trimmed}%`)
        .order("created_at", { ascending: false })
        .limit(30);

      if (!error) {
        setPosts(data ?? []);
      }
      setLoading(false);
      setSearched(true);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Search Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white px-4 py-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            <SearchIcon size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで投稿を検索..."
            autoFocus
            className="w-full rounded-lg bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" fillOpacity="0.2" />
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="mb-3 text-gray-300">
              <SearchIcon size={48} />
            </div>
            <p className="text-sm text-gray-400">
              キーワードを入力して投稿を検索
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <p className="text-sm font-semibold text-gray-900">
              見つかりませんでした
            </p>
            <p className="mt-1 text-xs text-gray-400">
              「{query}」に一致する投稿はありません
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-100 overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt={post.content ?? "投稿画像"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 items-center justify-around border-t border-gray-200 bg-white py-2">
        <NavLink href="/" icon={<HomeIcon />} label="ホーム" />
        <NavLink href="/search" icon={<SearchIcon />} label="検索" active />
        <NavLink href="/post" icon={<PlusSquareIcon />} label="投稿" />
        <NavLink href="/profile" icon={<UserIcon />} label="プロフィール" />
      </nav>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 transition-colors ${
        active ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
      }`}
    >
      {icon}
      <span className="text-[10px]">{label}</span>
    </Link>
  );
}
