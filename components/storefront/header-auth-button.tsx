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
        className="h-11 w-11 flex items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <button
      onClick={() => open("login")}
      aria-label="Sign In"
      className="h-11 w-11 flex items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
    >
      <User className="h-5 w-5" />
    </button>
  );
}
