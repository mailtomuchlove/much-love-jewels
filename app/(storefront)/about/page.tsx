import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Much Love Jewels — your destination for premium AD & imitation jewellery.",
};

export default function AboutPage() {
  return (
    <div className="container-site py-12 md:py-20 max-w-3xl">
      <p className="text-brand-gold text-xs font-semibold uppercase tracking-[0.2em] mb-4">
        Our Story
      </p>
      <h1 className="heading-h1 mb-6">About Much Love Jewels</h1>

      <div className="space-y-5 text-brand-text-muted leading-relaxed">
        <p>
          Much Love Jewels was born from a simple belief — every woman deserves to feel
          like royalty, without spending a fortune. We curate stunning AD (American Diamond)
          and imitation jewellery that looks indistinguishable from the real thing.
        </p>
        <p>
          From grand bridal sets to everyday elegance, our collection spans necklaces,
          earrings, bangles, rings, maang tikkas, and more. Every piece is handpicked for
          quality, finish, and that undeniable wow factor.
        </p>
        <p>
          We believe jewellery is not just an accessory — it&apos;s an expression of who you
          are. Whether you&apos;re dressing up for a wedding, a festival, or just because,
          Much Love Jewels has something perfect for you.
        </p>
        <p>
          <strong className="text-brand-navy">Quality Assured.</strong> Every piece is
          inspected before dispatch. We use premium-grade materials to ensure lasting
          shine and colour. Not happy? Reach out — we&apos;re always here.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/collections"
          className="inline-flex h-11 items-center justify-center rounded-md bg-brand-navy px-6 text-sm font-medium text-white hover:bg-brand-navy-light transition-colors"
        >
          Shop Now
        </Link>
        <Link
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi!%20I%20have%20a%20query.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-md border border-brand-border px-6 text-sm font-medium text-brand-navy hover:bg-brand-cream transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
