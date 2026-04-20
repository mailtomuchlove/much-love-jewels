"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Mode = "login" | "signup" | "forgot";

interface AuthModalCtx {
  isOpen: boolean;
  mode: Mode;
  nextUrl: string | null;
  open: (mode?: Mode, nextUrl?: string) => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalCtx>({
  isOpen: false,
  mode: "login",
  nextUrl: null,
  open: () => {},
  close: () => {},
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [nextUrl, setNextUrl] = useState<string | null>(null);

  function open(m: Mode = "login", next?: string) {
    setMode(m);
    setNextUrl(next ?? null);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setNextUrl(null);
  }

  // Lock scroll when modal is open (same pattern as CartDrawer)
  useEffect(() => {
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { stop: () => void; start: () => void }
      | undefined;
    if (!lenis) return;
    if (isOpen) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [isOpen]);

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, nextUrl, open, close }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthModalContext);
