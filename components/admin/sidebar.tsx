"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/categories", label: "Categories", icon: Tag, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-brand-navy text-white flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/" className="block">
          <span className="font-poppins text-base font-bold">
            Much Love <span className="text-brand-gold">Jewels</span>
          </span>
          <span className="block text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">
            Admin Panel
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
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
    </aside>
  );
}
