import type { Metadata } from "next";
import { SalonHero } from "@/components/salon/salon-hero";
import { SalonStats } from "@/components/salon/salon-stats";
import { SalonScrollStory } from "@/components/salon/salon-scroll-story";
import { SalonStory } from "@/components/salon/salon-story";
import { SalonServices } from "@/components/salon/salon-services";
import { SalonBeforeAfter } from "@/components/salon/salon-before-after";
import { SalonTestimonials } from "@/components/salon/salon-testimonials";
import { SalonCta } from "@/components/salon/salon-cta";
import { SalonInstagram } from "@/components/salon/salon-instagram";
import type { BeholdPost } from "@/components/storefront/instagram-section";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Much Love Salon",
  description: "Bespoke bridal makeup and hair artistry. Book your consultation today.",
};

async function getInstagramPosts(): Promise<{ handle: string; posts: BeholdPost[] }> {
  const feedUrl = process.env.BEHOLD_SALON_FEED_URL ?? process.env.BEHOLD_FEED_URL;
  const handle = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE ?? "muchlove.salon";

  if (!feedUrl) return { handle, posts: [] };

  try {
    const res = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json() as { username?: string; posts?: BeholdPost[] };
    const posts = (data.posts ?? [])
      .filter((p) => p.mediaType !== "VIDEO" || !!p.thumbnailUrl)
      .slice(0, 8);
    return { handle: data.username ?? handle, posts };
  } catch {
    return { handle, posts: [] };
  }
}

export default async function SalonPage() {
  const { handle, posts } = await getInstagramPosts();

  return (
    <main>
      <SalonHero />
      <SalonStats />
      <SalonScrollStory />
      <SalonStory />
      <SalonServices />
      <SalonBeforeAfter />
      <SalonTestimonials />
      <SalonCta />
      {posts.length > 0 && <SalonInstagram handle={handle} posts={posts} />}
    </main>
  );
}
