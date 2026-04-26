import Link from "next/link";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MobileMenu } from "./mobile-menu";
import { CartButton } from "./cart-button";
import { SearchBar } from "./search-bar";
import { HeaderScrollWrapper } from "./header-scroll-wrapper";
import { HeaderAuthButton } from "./header-auth-button";
import { SalonCta } from "./salon-cta";

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
      <header className="relative">
        <div
          className="flex items-center justify-between h-[60px] md:h-[72px]"
          style={{ padding: "0 clamp(16px, 4vw, 56px)" }}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-poppins text-lg md:text-xl font-bold text-white leading-none">
              Much Love{" "}
              <span className="text-brand-gold">Jewels</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative group text-[11px] font-normal tracking-[0.18em] uppercase text-white/75 hover:text-white transition-colors duration-300"
              >
                {link.label}
                <span className="absolute left-0 bottom-[-3px] h-[1px] w-0 group-hover:w-full transition-all duration-300 bg-brand-gold" />
              </Link>
            ))}
          </nav>

          {/* Search bar — desktop only */}
          <div className="hidden md:flex flex-1 max-w-[180px] lg:max-w-[240px] mx-4">
            <SearchBar variant="dark" className="w-full" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Wishlist — desktop only */}
            <Link
              href="/account?tab=wishlist"
              aria-label="Wishlist"
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-md text-white/75 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>

            {/* Account */}
            <HeaderAuthButton isLoggedIn={!!user} />

            {/* Cart */}
            <CartButton serverCount={cartCount} />

            {/* Salon CTA — desktop only */}
            <SalonCta />

            {/* Mobile menu — trigger sits at far right */}
            <MobileMenu
              navLinks={navLinks}
              user={user ? { name: (user.user_metadata?.name as string | undefined) ?? user.email ?? null } : null}
            />
          </div>
        </div>
      </header>
    </HeaderScrollWrapper>
  );
}
