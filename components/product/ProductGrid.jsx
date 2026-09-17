import { PackageSearch } from "lucide-react";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <PackageSearch size={40} className="text-ink-faint" />
        <p className="font-display text-base font-semibold text-ink">
          Nothing here yet
        </p>
        <p className="max-w-xs text-sm text-ink-soft">
          Try a different category or search term.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
