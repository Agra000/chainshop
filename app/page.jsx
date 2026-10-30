"use client";

import { useEffect, useState } from "react";
import { searchProducts } from "@/data/products";
import { fetchCategories, getCategoryLabel } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PromoBanner } from "@/components/common/PromoBanner";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function HomePage({ searchParams }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = searchParams?.category || "all";
  const query = searchParams?.q || "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [data] = await Promise.all([
        searchProducts({ category, query }),
        fetchCategories(),
      ]);
      setProducts(data);
      setLoading(false);
    }

    loadData();
  }, [category, query]);

  const heading = query ? `Results for "${query}"` : getCategoryLabel(category);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PromoBanner />

      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {heading}
          </h2>
          {loading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="text-sm text-ink-faint">
              {products.length} products
            </span>
          )}
        </div>
        {loading ? <ProductGridSkeleton /> : <ProductGrid products={products} />}
      </div>
    </div>
  );
}
