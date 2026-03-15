import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { HeartIcon, SendIcon } from "./icons";
import Feed, { type Post } from "./feed";
import BottomNav from "./components/bottom-nav";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<Post[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch posts:", error.message);
    return [];
  }

  return data ?? [];
}

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const posts = await getPosts();

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 italic">
          Photogram
        </h1>
        <div className="flex items-center gap-5">
          <button className="hover:text-gray-500 transition-colors">
            <HeartIcon />
          </button>
          <button className="hover:text-gray-500 transition-colors">
            <SendIcon />
          </button>
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1 overflow-y-auto px-0 py-2 pb-20">
        <Feed posts={posts} currentUserId={user.id} />
      </main>

      {/* Bottom Navigation */}
      <BottomNav userEmail={user?.email ?? null} />
    </div>
  );
}
