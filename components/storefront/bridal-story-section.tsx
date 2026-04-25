import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";

export function BridalStorySection() {
  return (
    <section className="section bg-brand-cream border-y border-brand-border">
      <div className="container-site">
        <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-lg border border-brand-border">
          {/* Left — image */}
          <div className="relative min-h-[300px] md:min-h-[420px] overflow-hidden bg-brand-navy">
            <img
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80"
              alt="Bridal jewellery craftsmanship"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/50 to-transparent" />
            {/* Bottom label */}
            <div className="absolute bottom-5 left-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold/80">
                The Bridal Edit
              </span>
            </div>
          </div>

          {/* Right — story text */}
          <div className="flex flex-col justify-center p-10 md:p-14 bg-white">
            <FadeIn>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gold mb-4">
                The Bridal Edit
              </p>
              <h2 className="heading-h2 mb-5">
                Crafted for your most beautiful day
              </h2>
              <p className="text-brand-text-muted text-sm leading-relaxed mb-3">
                Every bride deserves jewellery that tells her story. Our bridal collections are crafted
                with meticulous attention to detail — from the sparkle of American Diamond to the
                richness of gold-plated finishes.
              </p>
              <p className="text-brand-text-muted text-sm leading-relaxed mb-8">
                Whether you envision a grand statement necklace or delicate everyday pieces,
                Much Love Jewels has your bridal look covered from head to toe.
              </p>
              <Link
                href="/collections?tag=bridal"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors underline underline-offset-4"
              >
                Explore Bridal Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
