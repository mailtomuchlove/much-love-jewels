import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, discountPercent } from "@/lib/utils";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { StockIndicator } from "@/components/storefront/stock-indicator";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Star, Shield, Truck, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true);
  return data?.map((p) => ({ slug: p.slug })) ?? [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, meta_title, meta_description, images, image_public_ids, price")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Product Not Found" };

  return {
    title: data.meta_title ?? data.name,
    description:
      data.meta_description ??
      `Buy ${data.name} at ${formatPrice(data.price)}. Premium handcrafted jewellery.`,
    openGraph: {
      images: data.images?.[0] ? [{ url: data.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "*, categories(id, name, slug), product_variants(*), reviews(id, rating, comment, created_at, profiles(name))"
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const category = product.categories as { id: string; name: string; slug: string } | null;
  const variants = product.product_variants ?? [];
  const reviews = (product.reviews ?? []).filter((r: { is_approved: boolean }) => r.is_approved);

  const discount = discountPercent(product.price, product.compare_price);
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : null;

  // Related products
  const { data: relatedProducts } = category
    ? await supabase
        .from("products")
        .select("id, name, slug, price, compare_price, images, image_public_ids, stock, material")
        .eq("category_id", category.id)
        .eq("is_active", true)
        .neq("id", product.id)
        .limit(4)
    : { data: [] };

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    ...(avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-site py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-brand-text-muted mb-6" aria-label="Breadcrumb">
          <a href="/" className="hover:text-brand-navy transition-colors">Home</a>
          {" / "}
          {category && (
            <>
              <a
                href={`/collections/${category.slug}`}
                className="hover:text-brand-navy transition-colors"
              >
                {category.name}
              </a>
              {" / "}
            </>
          )}
          <span className="text-brand-navy font-medium">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">
          {/* Image Gallery — 6 cols */}
          <div className="md:col-span-6">
            <ImageGallery
              publicIds={product.image_public_ids ?? []}
              fallbackImages={product.images ?? []}
              productName={product.name}
            />
          </div>

          {/* Product Info — 6 cols */}
          <div className="md:col-span-6 flex flex-col">
            {/* Category */}
            {category && (
              <a
                href={`/collections/${category.slug}`}
                className="text-xs font-semibold text-brand-text-muted uppercase tracking-wide hover:text-brand-gold transition-colors mb-2"
              >
                {category.name}
              </a>
            )}

            {/* Title */}
            <h1 className="font-poppins text-2xl font-bold text-brand-navy leading-tight mb-3 md:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating !== null && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(avgRating)
                          ? "fill-brand-gold text-brand-gold"
                          : "text-gray-200 fill-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-brand-text-muted">
                  {avgRating.toFixed(1)} ({reviews.length} review
                  {reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-brand-navy">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-base text-brand-text-muted line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
              {discount && (
                <span className="badge-gold">{discount}% off</span>
              )}
            </div>

            {/* Stock */}
            <div className="mb-5">
              <StockIndicator stock={product.stock} />
            </div>

            <Separator className="mb-5" />

            {/* Meta */}
            {(product.material || product.weight_grams) && (
              <div className="flex gap-4 mb-5 text-sm">
                {product.material && (
                  <div>
                    <span className="font-medium text-brand-navy">Material:</span>{" "}
                    <span className="text-gray-600">{product.material}</span>
                  </div>
                )}
                {product.weight_grams && (
                  <div>
                    <span className="font-medium text-brand-navy">Weight:</span>{" "}
                    <span className="text-gray-600">{product.weight_grams}g</span>
                  </div>
                )}
              </div>
            )}

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold text-brand-navy mb-2">
                  Size / Variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: { id: string; label: string; stock: number }) => (
                    <button
                      key={v.id}
                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                        v.stock === 0
                          ? "opacity-40 cursor-not-allowed border-brand-border text-gray-400"
                          : "border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white"
                      }`}
                      disabled={v.stock === 0}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <div className="flex gap-3 mb-6">
              <AddToCartButton
                productId={product.id}
                stock={product.stock}
                className="flex-1 h-11"
                size="lg"
              />
              <WishlistButton
                productId={product.id}
                className="h-11 w-11 flex-shrink-0 border border-brand-border rounded-md"
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Quality Assured" },
                { icon: Truck, label: "Free Shipping" },
                { icon: Ban, label: "No Returns" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-md bg-brand-cream p-3 text-center"
                >
                  <Icon className="h-5 w-5 text-brand-navy" />
                  <span className="text-xs font-medium text-brand-navy">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile sticky add to cart */}
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-brand-border p-4 md:hidden">
          <AddToCartButton
            productId={product.id}
            stock={product.stock}
            className="w-full h-11"
            size="lg"
          />
        </div>

        {/* Tabs: Description, Care, Shipping */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="border-b border-brand-border bg-transparent h-auto rounded-none p-0 gap-0">
              {["description", "care", "shipping"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent px-5 py-3 text-sm font-medium capitalize text-gray-500 data-[state=active]:border-brand-navy data-[state=active]:text-brand-navy bg-transparent"
                >
                  {tab === "care" ? "Material & Care" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="description" className="pt-6">
              {product.description ? (
                <p className="text-sm leading-relaxed text-gray-700 max-w-2xl">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-gray-500">No description available.</p>
              )}
            </TabsContent>

            <TabsContent value="care" className="pt-6">
              <div className="text-sm leading-relaxed text-gray-700 max-w-2xl space-y-3">
                <p>• Store in a cool, dry place away from direct sunlight.</p>
                <p>• Avoid contact with perfumes, lotions, and chemicals.</p>
                <p>• Clean gently with a soft, dry cloth.</p>
                <p>• Remove jewellery before swimming or exercising.</p>
                {product.material && (
                  <p>• Material: {product.material}</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="pt-6">
              <div className="text-sm leading-relaxed text-gray-700 max-w-2xl space-y-3">
                <p>• Free shipping on orders above ₹999.</p>
                <p>• Standard delivery: 3–7 business days.</p>
                <p>• Express delivery available at checkout.</p>
                <p>• All orders are shipped in premium packaging.</p>
                <p>• 30-day hassle-free returns on all products.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mt-12">
            <h2 className="heading-h3 mb-6">Customer Reviews</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review: { id: string; rating: number; comment: string | null; created_at: string; profiles: { name: string | null } | null }) => (
                <div
                  key={review.id}
                  className="rounded-md border border-brand-border bg-white p-4"
                >
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-brand-gold text-brand-gold"
                            : "text-gray-200 fill-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <p className="mt-3 text-xs font-semibold text-brand-navy">
                    {review.profiles?.name ?? "Customer"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-14">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="heading-h3">You May Also Like</h2>
                <div className="divider-gold mt-2" />
              </div>
            </div>
            <ProductGrid products={relatedProducts as never} />
          </div>
        )}

        {/* Bottom padding for mobile sticky bar */}
        <div className="h-20 md:hidden" />
      </div>
    </>
  );
}
