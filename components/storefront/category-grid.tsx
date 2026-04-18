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
        <div className="mb-8 md:mb-10">
          <h2 className="heading-h2">Shop by Collection</h2>
          <div className="divider-gold mt-3" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group relative flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              style={{ animationDelay: `${i * 60}ms`, animationDuration: "0.45s" }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border-2 border-transparent bg-white shadow-sm transition-all duration-200 group-hover:border-brand-gold group-hover:shadow-md">
                {cat.image_url ? (
                  <SafeImage
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-cream to-brand-cream-dark flex items-center justify-center">
                    <span className="text-2xl font-bold text-brand-gold/30">
                      {cat.name[0]}
                    </span>
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
