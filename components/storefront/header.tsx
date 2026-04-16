import Link from "next/link";
import { ShoppingBag, Heart, User, Search, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";

const navLinks = [
  { label: "Collections", href: "/collections" },
  { label: "Rings", href: "/collections/rings" },
  { label: "Necklaces", href: "/collections/necklaces" },
  { label: "Earrings", href: "/collections/earrings" },
  { label: "About", href: "/about" },
];

async function getCartCount(userId: string | undefined): Promise<number> {
  if (!userId) return 0;
  const supabase = await createClient();
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);
  return data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cartCount = await getCartCount(user?.id);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white">
      <div className="container-site">
        <div className="flex h-[60px] items-center justify-between md:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-poppins text-lg font-bold text-brand-navy md:text-xl">
              Much Love{" "}
              <span className="text-brand-gold">Jewels</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-700 hover:text-brand-navy transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Search */}
            <Link
              href="/search"
              aria-label="Search"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Wishlist */}
            <Link
              href="/account?tab=wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>

            {/* Account */}
            <Link
              href={user ? "/account" : "/auth/login"}
              aria-label={user ? "My Account" : "Sign In"}
              className="h-9 w-9 flex items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Cart (Client Component — controls drawer) */}
            <CartButton serverCount={cartCount} />

            {/* Mobile menu */}
            <MobileMenu navLinks={navLinks} />
          </div>
        </div>
      </div>
    </header>
  );
}
