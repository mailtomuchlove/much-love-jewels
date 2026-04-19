import Link from "next/link";
import { SafeImage } from "@/components/ui/safe-image";
import type { Category } from "@/types";

interface CategoryGridProps {
  categories: Pick<Category, "id" | "name" | "slug" | "image_url">[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="section bg-brand-cream">
      <div className="container-site">
        <div className="mb-6 md:mb-10">
          <h2 className="heading-h2">Shop by Collection</h2>
          <div className="divider-gold mt-3" />
        </div>

        {/* ── Mobile: horizontal scroll ── */}
        <div className="relative lg:hidden">
          {/* Fade hint on right edge */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-brand-cream to-transparent z-10" />
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="group flex-shrink-0 flex flex-col items-center gap-2.5 snap-start w-[100px] animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${i * 60}ms`, animationDuration: "0.45s" }}
              >
                <div className="relative w-[100px] h-[100px] overflow-hidden rounded-full border-2 border-white bg-white shadow-md transition-all duration-200 group-hover:border-brand-gold group-active:scale-95">
                  {cat.image_url ? (
                    <SafeImage
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="100px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-dark flex items-center justify-center">
                      <span className="text-2xl font-bold text-brand-gold/30">{cat.name[0]}</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-brand-navy text-center uppercase tracking-wider leading-tight group-hover:text-brand-gold transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Desktop: grid ── */}
        <div className="hidden lg:grid grid-cols-4 gap-6 xl:grid-cols-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${i * 60}ms`, animationDuration: "0.45s" }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-transparent bg-white shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md">
                {cat.image_url ? (
                  <SafeImage
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="20vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand-gold/30">{cat.name[0]}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-brand-navy text-center uppercase tracking-wide group-hover:text-brand-gold transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
