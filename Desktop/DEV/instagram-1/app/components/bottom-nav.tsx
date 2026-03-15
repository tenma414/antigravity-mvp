"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  PlusSquareIcon,
  UserIcon,
} from "@/app/icons";

export default function BottomNav({
  userEmail,
}: {
  userEmail: string | null;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 items-center justify-around border-t border-gray-200 bg-white py-2">
      <NavLink
        href="/"
        icon={<HomeIcon />}
        label="ホーム"
        active={pathname === "/"}
      />
      <NavLink
        href="/search"
        icon={<SearchIcon />}
        label="検索"
        active={pathname === "/search"}
      />
      <NavLink
        href="/post"
        icon={<PlusSquareIcon />}
        label="投稿"
        active={pathname === "/post"}
      />
      {userEmail ? (
        <NavLink
          href="/profile"
          icon={<UserIcon />}
          label="プロフィール"
          active={pathname === "/profile"}
        />
      ) : (
        <NavLink
          href="/login"
          icon={<UserIcon />}
          label="ログイン"
          active={pathname === "/login"}
        />
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
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
