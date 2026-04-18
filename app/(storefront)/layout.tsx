import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { WishlistInitializer } from "@/components/storefront/wishlist-initializer";
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
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <WishlistInitializer productIds={wishlistIds} />
      <Toaster position="top-right" richColors />
    </div>
  );
}
