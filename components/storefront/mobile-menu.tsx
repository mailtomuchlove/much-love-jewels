"use client";

import { useState, useEffect } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import Link from "next/link";
import { Menu, X, LogOut, User } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthModal } from "@/lib/auth-modal-context";

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
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-md text-gray-600 hover:text-brand-navy md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          <div className="flex h-[60px] items-center justify-between border-b px-4">
            <span className="font-poppins text-lg font-bold text-brand-navy">
              Much Love <span className="text-brand-gold">Jewels</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="h-11 w-11 flex items-center justify-center rounded-md text-gray-500 hover:text-brand-navy hover:bg-brand-cream transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-4 py-6 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-base font-medium text-gray-700 hover:text-brand-navy transition-colors border-b border-brand-border last:border-0"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="mt-6 flex items-center gap-2 py-2.5 text-base font-medium text-brand-navy border-b border-brand-border"
                >
                  <User className="h-4 w-4" />
                  {user.name ?? "My Account"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2.5 text-base font-medium text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setOpen(false); openAuthModal("login"); }}
                className="mt-6 py-2.5 text-base font-medium text-brand-navy text-left"
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
