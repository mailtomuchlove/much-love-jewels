import { Star } from "lucide-react";
import type { Review } from "@/types";

type ReviewWithProfile = Review & {
  profiles: { name: string | null } | null;
};

interface ReviewsSectionProps {
  reviews: ReviewWithProfile[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-brand-gold text-brand-gold"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="section">
      <div className="container-site">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="heading-h2">What Our Customers Say</h2>
          <div className="divider-gold mt-3 mx-auto" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-md border border-brand-border bg-white p-5"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <StarRating rating={review.rating} />
              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-gray-700 line-clamp-3">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
              <p className="mt-4 text-xs font-semibold text-brand-navy">
                {review.profiles?.name || "Customer"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
