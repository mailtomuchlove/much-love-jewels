"use client";

import { useState, useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import Link from "next/link";
import { X, LogOut, User } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthModal } from "@/lib/auth-modal-context";
import { SalonNavLink } from "./salon-nav-link";

interface MobileMenuProps {
  navLinks: { label: string; href: string }[];
  user: { name: string | null } | null;
}

export function MobileMenu({ navLinks, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { open: openAuthModal } = useAuthModal();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    if (open) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [open]);

  return (
    <>
      {/* 3-line salon-style hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col gap-[5px] p-2 ml-1"
        aria-label="Open menu"
      >
        <span className="block w-[22px] h-[1px] bg-white/80" />
        <span className="block w-[22px] h-[1px] bg-white/80" />
        <span className="block w-[22px] h-[1px] bg-white/80" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[280px] p-0 bg-brand-navy border-l border-white/10" showCloseButton={false}>
          <div className="flex h-[60px] items-center justify-between border-b border-white/10 px-5">
            <span className="font-poppins text-base font-bold text-white">
              Much Love <span className="text-brand-gold">Jewels</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="h-9 w-9 flex items-center justify-center rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex flex-col px-5 py-6 gap-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[11px] font-normal tracking-[0.18em] uppercase text-white/70 hover:text-white transition-colors border-b border-white/10 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <SalonNavLink
              className="py-3 text-[11px] font-normal tracking-[0.18em] uppercase text-brand-gold hover:text-brand-gold-light transition-colors border-b border-white/10"
              onNavigate={() => setOpen(false)}
            />

            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="mt-6 flex items-center gap-2 py-3 text-[11px] tracking-[0.18em] uppercase text-white/70 hover:text-white border-b border-white/10"
                >
                  <User className="h-3.5 w-3.5" />
                  {user.name ?? "My Account"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-3 text-[11px] tracking-[0.18em] uppercase text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); openAuthModal("login"); }}
                className="mt-6 py-3 text-[11px] tracking-[0.18em] uppercase text-white/70 hover:text-white text-left"
              >
                Sign In / Register
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
