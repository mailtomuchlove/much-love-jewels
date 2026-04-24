import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://muchlovejewels.com";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Much Love Jewels — your destination for premium AD & imitation jewellery.",
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    images: [{ url: "/og-home.jpg", width: 1200, height: 630, alt: "Much Love Jewels" }],
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AD jewellery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AD jewellery uses American Diamond (cubic zirconia) stones that closely resemble real diamonds. It is premium-quality imitation jewellery popular for bridal wear and festive occasions in India.",
      },
    },
    {
      "@type": "Question",
      name: "Is imitation jewellery durable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Quality imitation jewellery from Much Love Jewels uses premium-grade materials that retain their shine and colour with proper care. Store in a cool, dry place and avoid contact with water and chemicals.",
      },
    },
    {
      "@type": "Question",
      name: "Do you ship across India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, we ship pan-India. Free shipping is available on orders above ₹999. Standard delivery takes 3–7 business days.",
      },
    },
    {
      "@type": "Question",
      name: "How do I care for AD jewellery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Keep AD jewellery away from water, perfumes, and chemicals. Clean with a soft dry cloth and store in a jewellery box. Remove before swimming or exercising.",
      },
    },
  ],
};

export default function AboutPage() {
  return (
    <div className="container-site py-12 md:py-20 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
