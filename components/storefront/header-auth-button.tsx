"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuthModal } from "@/lib/auth-modal-context";

export function HeaderAuthButton({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { open } = useAuthModal();

  if (isLoggedIn) {
    return (
      <Link
        href="/account"
        aria-label="My Account"
        className="h-10 w-10 flex items-center justify-center rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
      >
        <User className="h-[18px] w-[18px]" />
      </Link>
    );
  }

  return (
    <button
      onClick={() => open("login")}
      aria-label="Sign In"
      className="h-10 w-10 flex items-center justify-center rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
    >
      <User className="h-[18px] w-[18px]" />
    </button>
  );
}
