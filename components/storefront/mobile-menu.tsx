"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface MobileMenuProps {
  navLinks: { label: string; href: string }[];
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

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
        <SheetContent side="left" className="w-[280px] p-0">
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
            <Link
              href="/auth/login"
              onClick={() => setOpen(false)}
              className="mt-6 py-2.5 text-base font-medium text-brand-navy"
            >
              Sign In / Register
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
