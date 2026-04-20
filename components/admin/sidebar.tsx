"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Image,
  Layers,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/categories", label: "Categories", icon: Tag, exact: false },
  { href: "/admin/hero", label: "Hero Banners", icon: Image, exact: false },
  { href: "/admin/sections", label: "Homepage Sections", icon: Layers, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
          <span className="font-poppins text-base font-bold">
            Much Love <span className="text-brand-gold">Jewels</span>
          </span>
          <span className="block text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">
            Admin Panel
          </span>
        </Link>
        {/* Close button — mobile only */}
        <button
          className="lg:hidden text-white/60 hover:text-white p-1"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="h-4 w-4 flex-shrink-0">↗</span>
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-14 bg-brand-navy flex items-center px-4 gap-3 border-b border-white/10">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="text-white/70 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-poppins text-sm font-bold text-white">
          Much Love <span className="text-brand-gold">Jewels</span>
        </span>
        <span className="ml-auto text-[10px] text-white/40 tracking-widest uppercase">Admin</span>
      </div>

      {/* ── Mobile overlay backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-navy text-white transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-brand-navy text-white flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}
