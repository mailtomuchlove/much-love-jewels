import { ProductCard, type ProductCardData } from "./product-card";
import { PackageSearch } from "lucide-react";

interface ProductGridProps {
  products: ProductCardData[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="h-12 w-12 text-brand-border mb-4" />
        <p className="text-base font-medium text-gray-700">{emptyMessage}</p>
        <p className="text-sm text-gray-500 mt-1">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
