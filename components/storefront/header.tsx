import Link from "next/link";
import { Heart, User, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { HeaderScrollWrapper } from "./header-scroll-wrapper";

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
    <HeaderScrollWrapper>
    <header className="sticky top-0 z-40 border-b border-brand-border bg-white">
      <div className="container-site">
        <div className="flex h-[60px] items-center justify-between md:h-[72px]">
          {/* Mobile menu trigger — visible only on mobile, sits before logo */}
          <div className="md:hidden">
            <MobileMenu
              navLinks={navLinks}
              user={user ? { name: (user.user_metadata?.name as string | undefined) ?? user.email ?? null } : null}
            />
          </div>

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

          {/* Desktop search bar — sits between nav and icons */}
          <div className="hidden sm:flex flex-1 max-w-[200px] md:max-w-[240px] lg:max-w-[300px] mx-3">
            <SearchBar className="w-full" />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile search icon — navigates to /search page */}
            <Link
              href="/search"
              aria-label="Search"
              className="sm:hidden h-9 w-9 flex items-center justify-center rounded-md text-gray-600 hover:text-brand-navy hover:bg-brand-cream transition-colors"
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
          </div>
        </div>
      </div>
    </header>
    </HeaderScrollWrapper>
  );
}
