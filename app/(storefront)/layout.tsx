import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawerLazy } from "@/components/storefront/cart-drawer-lazy";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { WishlistInitializer } from "@/components/storefront/wishlist-initializer";
import { AuthModalProvider } from "@/lib/auth-modal-context";
import { AuthModal } from "@/components/storefront/auth-modal";
import { AuthModalTrigger } from "@/components/storefront/auth-modal-trigger";
import { SalonTransitionOverlay } from "@/components/storefront/salon-transition-overlay";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let wishlistIds: string[] = [];
  if (user) {
    const { data } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", user.id);
    wishlistIds = (data ?? []).map((r) => r.product_id);
  }

  return (
    <AuthModalProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawerLazy />
        <WhatsAppButton />
        <SalonTransitionOverlay />
        <WishlistInitializer productIds={wishlistIds} />
        <Toaster />
        <AuthModal />
        <Suspense fallback={null}>
          <AuthModalTrigger />
        </Suspense>
      </div>
    </AuthModalProvider>
  );
}
