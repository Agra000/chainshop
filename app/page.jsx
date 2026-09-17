import { searchProducts } from "@/data/products";
import { getCategoryLabel } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PromoBanner } from "@/components/common/PromoBanner";

export default function HomePage({ searchParams }) {
  const category = searchParams?.category || "all";
  const query = searchParams?.q || "";
  const products = searchProducts({ category, query });

  const heading = query
    ? `Results for "${query}"`
    : getCategoryLabel(category);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PromoBanner />

      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">{heading}</h2>
          <span className="text-sm text-ink-faint">{products.length} products</span>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
