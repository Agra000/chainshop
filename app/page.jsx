"use client";

import { useEffect, useState } from "react";
import { fetchProducts, searchProducts } from "@/data/products";
import { getCategoryLabel } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { PromoBanner } from "@/components/common/PromoBanner";

export default function HomePage({ searchParams }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams?.category || "all";
  const query = searchParams?.q || "";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchProducts();
      const data = await searchProducts({ category, query });
      setProducts(data);
      setLoading(false);
    }

    loadData();
  }, [category, query]); // Otomatis re-fetch jika category atau query berubah

  const heading = query ? `Results for "${query}"` : getCategoryLabel(category);

  if (loading)
    return <p className="p-8 text-center text-ink-faint">Loading produk...</p>;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <PromoBanner />

      <div>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            {heading}
          </h2>
          <span className="text-sm text-ink-faint">
            {products.length} products
          </span>
        </div>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
