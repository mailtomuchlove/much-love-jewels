import Link from "next/link";
import { ShieldCheck, Truck, Sparkles, PackageCheck } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getHeroBanners } from "@/app/actions/hero-banners";
import { getHomepageSections } from "@/app/actions/homepage-sections";
import { HeroBanner } from "@/components/storefront/hero-banner";
import { CategoryGrid } from "@/components/storefront/category-grid";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ReviewsSection } from "@/components/storefront/reviews-section";
import { InstagramSection, type BeholdPost } from "@/components/storefront/instagram-section";
import { FadeIn } from "@/components/motion/fade-in";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Much Love Jewels — AD & Imitation Bridal Jewellery",
  description:
    "Shop stunning AD & imitation jewellery online — bridal sets, necklaces, earrings, bangles and more. Bold designs, affordable prices.",
  keywords: ["AD jewellery", "imitation jewellery", "bridal jewellery", "south indian jewellery", "much love jewels", "bridal set", "necklace set", "American Diamond jewellery"],
  openGraph: {
    images: [{ url: "/og-home.jpg", width: 1200, height: 630, alt: "Much Love Jewels — AD & Imitation Bridal Jewellery" }],
  },
};

const trustBadges = [
  { icon: ShieldCheck,  title: "Quality Assured",     desc: "Every piece checked before dispatch" },
  { icon: Truck,        title: "Free Shipping",        desc: "On orders above ₹999" },
  { icon: Sparkles,     title: "Trendy AD Designs",   desc: "Latest bridal & fashion jewellery" },
  { icon: PackageCheck, title: "Safe Packaging",      desc: "Bubble-wrapped & securely packed" },
];

export default async function HomePage() {
  const supabase = await createClient();

  const [heroBanners, categoriesRes, featuredRes, reviewsRes, homepageSections, instaRes] = await Promise.all([
    getHeroBanners().catch(() => []),
    supabase
      .from("categories")
      .select("id, name, slug, image_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(8),
    supabase
      .from("products")
      .select("id, name, slug, price, compare_price, images, image_public_ids, stock, material, categories(name, slug)")
      .eq("is_featured", true)
      .eq("is_active", true)
      .limit(8),
    supabase
      .from("reviews")
      .select("id, rating, comment, created_at, profiles(name)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(6),
    getHomepageSections().catch(() => []),
    process.env.BEHOLD_FEED_URL
      ? fetch(process.env.BEHOLD_FEED_URL, { next: { revalidate: 3600 } })
          .then((r) => r.json())
          .catch(() => null)
      : Promise.resolve(null),
  ]);

  const categories = categoriesRes.data ?? [];
  const featuredProducts = featuredRes.data ?? [];
  const reviews = reviewsRes.data ?? [];
  const beholdData = instaRes as { username?: string; posts?: BeholdPost[] } | null;
  const instagramHandle = beholdData?.username ?? process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "";
  const instagramPosts: BeholdPost[] = (beholdData?.posts ?? [])
    .filter((p) => p.mediaType !== "VIDEO" || !!p.thumbnailUrl)
    .slice(0, 8);

  const sectionProducts = await Promise.all(
    homepageSections.map((section) =>
      supabase
        .from("products")
        .select("id, name, slug, price, compare_price, images, image_public_ids, stock, material, categories(name, slug)")
        .contains("tags", [section.tag])
        .eq("is_active", true)
        .limit(8)
        .then((r) => ({ section, products: r.data ?? [] }))
    )
  );

  return (
    <>
      <HeroBanner slides={heroBanners} />

      {/* Trust badges */}
      <section className="border-b border-brand-border bg-white">
        <div className="container-site py-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trustBadges.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
                style={{ animationDelay: `${i * 60}ms`, animationDuration: "0.4s" }}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-cream flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-navy" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-navy leading-tight">{title}</p>
                  <p className="text-xs text-brand-text-muted leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && <CategoryGrid categories={categories} />}

      {featuredProducts.length > 0 && (
        <section className="section">
          <div className="container-site">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <h2 className="heading-h2">Featured Jewellery</h2>
                <div className="divider-gold mt-3" />
              </div>
              <Link href="/collections" className="text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors underline underline-offset-4">
                View All
              </Link>
            </div>
            <ProductGrid products={featuredProducts as never} />
          </div>
        </section>
      )}

      {sectionProducts
        .filter((sp) => sp.products.length > 0)
        .map(({ section, products }) => (
          <section key={section.id} className="section">
            <div className="container-site">
              <div className="flex items-end justify-between mb-8 md:mb-10">
                <div>
                  <h2 className="heading-h2">{section.title}</h2>
                  <div className="divider-gold mt-3" />
                </div>
                <Link href={`/collections?tag=${encodeURIComponent(section.tag)}`} className="text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors underline underline-offset-4">
                  View All
                </Link>
              </div>
              <ProductGrid products={products as never} />
            </div>
          </section>
        ))}

      {/* Brand story */}
      <section className="section bg-brand-navy">
        <div className="container-site">
          <FadeIn className="max-w-2xl mx-auto text-center">
            <p className="text-brand-gold-light text-xs font-semibold uppercase tracking-[0.2em] mb-4">Our Story</p>
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-white mb-5 leading-tight">
              Look Royal, Without Spending a Fortune
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8">
              Much Love Jewels brings you the finest AD and imitation jewellery —
              gorgeous bridal sets, statement necklaces, and everyday pieces that
              look stunning without breaking the bank. Because every woman deserves
              to feel like a queen.
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-medium text-brand-gold hover:text-brand-gold-light transition-colors underline underline-offset-4">
              Learn about us
            </Link>
          </FadeIn>
        </div>
      </section>

      {reviews.length > 0 && <ReviewsSection reviews={reviews as never} />}

      {/* WhatsApp CTA */}
      <section className="section-sm bg-brand-cream border-t border-brand-border">
        <FadeIn className="container-site text-center">
          <p className="text-base font-medium text-brand-navy mb-2">
            Need help picking the perfect bridal set or AD jewellery?
          </p>
          <p className="text-sm text-brand-text-muted mb-5">
            Chat with us on WhatsApp — we&apos;ll help you find exactly what you&apos;re looking for!
          </p>
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi!%20I%20need%20help%20with%20a%20jewellery%20query.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1fb959] transition-colors"
          >
            Chat on WhatsApp
          </Link>
        </FadeIn>
      </section>

      {instagramHandle && instagramPosts.length > 0 && (
        <InstagramSection handle={instagramHandle} posts={instagramPosts} />
      )}
    </>
  );
}
