"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LogOut, User } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface MobileMenuProps {
  navLinks: { label: string; href: string }[];
  user: { name: string | null } | null;
}

export function MobileMenu({ navLinks, user }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  useEffect(() => {
    const lenis = (window as unknown as Record<string, unknown>).__lenis as
      | { stop: () => void; start: () => void }
      | undefined;
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
    return () => lenis.start();
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-brand-navy md:hidden"
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
              className="text-gray-500"
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
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="mt-6 py-2.5 text-base font-medium text-brand-navy"
              >
                Sign In / Register
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
