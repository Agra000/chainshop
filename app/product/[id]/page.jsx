"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { MapPin, Store } from "lucide-react";
import { getProductById, getRelatedProducts } from "@/data/products";
import { reviewService } from "@/services/ReviewService";
import { formatDate, formatUSDT } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { RatingStars } from "@/components/common/RatingStars";
import { EscrowBadge } from "@/components/common/EscrowBadge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductGrid } from "@/components/product/ProductGrid";

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getProductById(params.id);
      setProduct(data);
      setLoading(false);
      if (!data) return;

      const [relatedData, reviewRes] = await Promise.all([
        getRelatedProducts(data),
        reviewService.GetProductReviews(data.id).catch(() => ({ data: [] })),
      ]);
      setRelated(relatedData);
      setReviews(reviewRes.data || []);
    }

    loadData();
  }, [params.id]);

  if (loading)
    return <p className="p-8 text-center text-ink-faint">Loading produk...</p>;

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/" />

      <div className="mt-2 grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              {product.category}
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-ink-faint">
                {product.sold.toLocaleString("en-US")} sold
              </span>
            </div>
          </div>

          <p className="font-display text-3xl font-bold text-ink">
            {formatUSDT(product.price)}
          </p>

          <EscrowBadge className="w-fit" text="Payment held in escrow until delivered" />

          <div className="flex items-center gap-2 rounded-xl border border-border bg-paper/60 px-4 py-3 text-sm">
            <Store size={16} className="text-ink-soft" />
            <span className="font-medium text-ink">{product.seller}</span>
            <span className="text-ink-faint">•</span>
            <MapPin size={14} className="text-ink-soft" />
            <span className="text-ink-soft">{product.location}</span>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Description</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Specifications</h2>
          <dl className="mt-3 flex flex-col divide-y divide-border">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-2 py-2 text-sm">
                <dt className="text-ink-faint">{key}</dt>
                <dd className="text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {reviews.length > 0 && (
        <section className="card mt-6 p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Reviews ({reviews.length})
          </h2>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {reviews.map((r) => (
              <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ink">{r.buyerName}</span>
                  <RatingStars rating={r.rating} />
                  <span className="ml-auto text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">
            You might also like
          </h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  );
}
