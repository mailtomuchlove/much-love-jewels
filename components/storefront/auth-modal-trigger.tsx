"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthModal } from "@/lib/auth-modal-context";

export function AuthModalTrigger() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { open } = useAuthModal();

  useEffect(() => {
    if (searchParams.get("modal") === "login") {
      const next = searchParams.get("next") ?? undefined;
      open("login", next);
      // Clean up URL so the params don't persist on refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete("modal");
      params.delete("next");
      const cleaned = pathname + (params.size > 0 ? `?${params}` : "");
      router.replace(cleaned, { scroll: false });
    }
  // Run only on mount — searchParams identity changes on every render in dev
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
