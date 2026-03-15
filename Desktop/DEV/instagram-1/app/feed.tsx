"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase/client";
import {
  HeartIcon,
  HeartFilledIcon,
  MessageCircleIcon,
  SendIcon,
  BookmarkIcon,
} from "./icons";

export type Post = {
  id: string;
  content: string;
  image_url: string;
  likes: number;
  created_at: string;
};

type Comment = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
};

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function CommentSection({
  postId,
  currentUserId,
}: {
  postId: string;
  currentUserId: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!cancelled) {
          if (error) {
            console.error("Failed to fetch comments:", error.message);
          }
          setComments((data as Comment[]) ?? []);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setText("");

    const tempId = `temp-${Date.now()}`;
    const tempComment: Comment = {
      id: tempId,
      content: trimmed,
      user_id: currentUserId,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, tempComment]);

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: currentUserId, content: trimmed })
      .select("id, content, user_id, created_at")
      .single();

    if (error) {
      console.error("Failed to post comment:", error.message);
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setText(trimmed);
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? (data as Comment) : c))
      );
    }

    setSubmitting(false);
  }

  const displayName = () => "ユーザー";

  return (
    <div>
      {/* Comment List */}
      {!loading && comments.length > 0 && (
        <div className="px-4 pb-2 space-y-1">
          {comments.map((comment) => (
            <p key={comment.id} className="text-sm text-gray-900 leading-snug">
              <span className="font-semibold">{displayName()}</span>{" "}
              <span>{comment.content}</span>
            </p>
          ))}
        </div>
      )}

      {/* Comment Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-100 px-4 py-2"
      >
        <button
          type="button"
          onClick={() => inputRef.current?.focus()}
          className="flex-shrink-0 text-gray-400"
        >
          <MessageCircleIcon size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="コメントを追加..."
          className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        {text.trim() && (
          <button
            type="submit"
            disabled={submitting}
            className="flex-shrink-0 text-sm font-semibold text-blue-500 hover:text-blue-600 disabled:text-blue-300"
          >
            投稿
          </button>
        )}
      </form>
    </div>
  );
}

function PostCard({
  post: initial,
  currentUserId,
}: {
  post: Post;
  currentUserId: string;
}) {
  const [likes, setLikes] = useState(initial.likes);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLike() {
    if (busy) return;
    setBusy(true);

    const nextLikes = liked ? likes - 1 : likes + 1;
    setLikes(nextLikes);
    setLiked(!liked);

    const { error } = await supabase
      .from("posts")
      .update({ likes: nextLikes })
      .eq("id", initial.id);

    if (error) {
      setLikes(likes);
      setLiked(liked);
    }

    setBusy(false);
  }

  return (
    <article className="bg-white border border-gray-200 rounded-lg mb-4">
      {/* Post Header */}
      <div className="flex items-center px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-xs font-bold text-white">
          U
        </div>
        <span className="ml-3 text-sm font-semibold text-gray-900">user</span>
        <button className="ml-auto text-gray-500 hover:text-gray-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>

      {/* Post Image */}
      <div className="aspect-square w-full bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={initial.image_url}
          alt="投稿画像"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Action Buttons */}
      <div className="px-4 pt-3">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`transition-colors ${
              liked ? "text-red-500" : "hover:text-gray-500"
            }`}
          >
            {liked ? <HeartFilledIcon /> : <HeartIcon />}
          </button>
          <button className="hover:text-gray-500 transition-colors">
            <MessageCircleIcon />
          </button>
          <button className="hover:text-gray-500 transition-colors">
            <SendIcon />
          </button>
          <button className="ml-auto hover:text-gray-500 transition-colors">
            <BookmarkIcon />
          </button>
        </div>
      </div>

      {/* Likes & Caption */}
      <div className="px-4 pb-2 pt-2">
        <p className="text-sm font-semibold text-gray-900">
          {likes.toLocaleString()}件のいいね
        </p>
        {initial.content && (
          <p className="mt-1 text-sm text-gray-900">
            <span className="font-semibold">user</span> {initial.content}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {formatTimeAgo(initial.created_at)}
        </p>
      </div>

      {/* Comments */}
      <CommentSection postId={initial.id} currentUserId={currentUserId} />
    </article>
  );
}

export default function Feed({
  posts,
  currentUserId,
}: {
  posts: Post[];
  currentUserId: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-20 text-gray-400 text-sm">
        まだ投稿がありません
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </>
  );
}
