import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { HomeIcon, SearchIcon, PlusSquareIcon, UserIcon } from "@/app/icons";
import LogoutButton from "@/app/components/logout-button";

export const dynamic = "force-dynamic";

type Post = {
  id: string;
  image_url: string;
  content: string | null;
};

type Profile = {
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [postsResult, profileResult] = await Promise.all([
    supabase
      .from("posts")
      .select("id, image_url, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("username, bio, avatar_url")
      .eq("id", user.id)
      .single(),
  ]);

  const myPosts: Post[] = postsResult.data ?? [];
  const profile: Profile = profileResult.data ?? {
    username: null,
    bio: null,
    avatar_url: null,
  };

  const displayName =
    profile.username || user.email?.split("@")[0] || "user";

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">{displayName}</h1>
        <LogoutButton />
      </header>

      {/* Profile Info */}
      <section className="px-4 py-5">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 flex-shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-2xl font-bold text-white">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-1 items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-gray-900">
                {myPosts.length}
              </span>
              <span className="text-xs text-gray-500">投稿</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-gray-900">0</span>
              <span className="text-xs text-gray-500">フォロワー</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-bold text-gray-900">0</span>
              <span className="text-xs text-gray-500">フォロー中</span>
            </div>
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mt-4 space-y-0.5">
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>
          {profile.bio && (
            <p className="whitespace-pre-wrap text-sm text-gray-700">
              {profile.bio}
            </p>
          )}
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>

        {/* Edit Button */}
        <Link
          href="/profile/edit"
          className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
        >
          プロフィールを編集
        </Link>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Post Grid */}
      <main className="pb-20">
        {myPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-300">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              シェアした写真がありません
            </p>
            <p className="mt-1 text-xs text-gray-400">
              最初の一枚を投稿しましょう
            </p>
            <Link
              href="/post"
              className="mt-4 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              写真を投稿する
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {myPosts.map((post) => (
              <div
                key={post.id}
                className="aspect-square overflow-hidden bg-gray-100"
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
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <HomeIcon />
          <span className="text-[10px]">ホーム</span>
        </Link>
        <Link
          href="/search"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <SearchIcon />
          <span className="text-[10px]">検索</span>
        </Link>
        <Link
          href="/post"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <PlusSquareIcon />
          <span className="text-[10px]">投稿</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center gap-0.5 text-gray-900 transition-colors"
        >
          <UserIcon />
          <span className="text-[10px]">プロフィール</span>
        </Link>
      </nav>
    </div>
  );
}
