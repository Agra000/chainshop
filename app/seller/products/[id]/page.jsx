"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Boxes, Edit3, ExternalLink, MessageSquare, ShoppingBag, Star, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { BackButton } from "@/components/ui/BackButton";
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";
import { RatingStars } from "@/components/common/RatingStars";
import { DeleteProductModal } from "@/components/seller/DeleteProductModal";
import { reviewService } from "@/services/ReviewService";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatUSDT } from "@/lib/format";
import { toast } from "@/lib/toast";

// Detail produk milik toko sendiri ("Toko Saya"): deskripsi, rating & ulasan buyer, tombol edit dan hapus.
export default function SellerProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isSeller, hydrated } = useAuth();
  const { getProduct, deleteProduct } = useProducts();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;

    async function loadData() {
      const data = await getProduct(id);
      const reviewRes = data
        ? await reviewService.GetProductReviews(data.id).catch(() => ({ data: [] }))
        : { data: [] };
      if (cancelled) return;
      setProduct(data);
      setReviews(reviewRes.data || []);
      setLoaded(true);
    }

    loadData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, id]);

  const ownsProduct = product && product.sellerId === user?.storeId;

  // sama seperti halaman edit: buyer, toko lain, atau id tidak dikenal -> kembali ke dashboard
  useEffect(() => {
    if (!hydrated || !loaded) return;
    if (!isSeller || !product || !ownsProduct) router.replace("/seller");
  }, [hydrated, loaded, isSeller, product, ownsProduct, router]);

  // jumlah ulasan per bintang (5 -> 1) untuk ringkasan rating
  const distribution = useMemo(
    () => [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((r) => r.rating === star).length })),
    [reviews],
  );

  if (!hydrated || !loaded) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton />
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!isSeller || !product || !ownsProduct) return null;

  const ratingCount = product.ratingCount ?? reviews.length;
  const outOfStock = product.stock <= 0;
  const specs = Object.entries(product.specifications || {});

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProduct(user.storeId, product.id);
      toast.success(`"${product.name}" was deleted.`);
      router.replace("/seller");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete product."));
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="mt-2 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-start">
        <div className="card overflow-hidden">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center bg-paper text-ink-faint">
              <ShoppingBag size={40} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{product.category}</p>
              <span
                className={`chip !px-2.5 !py-0.5 ${outOfStock ? "bg-danger-soft text-danger" : "bg-ledger-soft text-ledger-dark"}`}
              >
                {outOfStock ? "Out of stock" : "Active"}
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">{product.name}</h1>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{formatUSDT(product.price)}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="card px-4 py-3">
              <Star size={15} className="mb-1.5 text-ink-faint" />
              <p className="font-display text-lg font-semibold text-ink">
                {ratingCount > 0 ? Number(product.rating).toFixed(1) : "–"}
              </p>
              <p className="text-xs text-ink-soft">
                {ratingCount} rating{ratingCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="card px-4 py-3">
              <ShoppingBag size={15} className="mb-1.5 text-ink-faint" />
              <p className="font-display text-lg font-semibold text-ink">{product.sold.toLocaleString("en-US")}</p>
              <p className="text-xs text-ink-soft">Sold</p>
            </div>
            <div className="card px-4 py-3">
              <Boxes size={15} className="mb-1.5 text-ink-faint" />
              <p className={`font-display text-lg font-semibold ${outOfStock ? "text-danger" : "text-ink"}`}>
                {product.stock.toLocaleString("en-US")}
              </p>
              <p className="text-xs text-ink-soft">In stock</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/seller/products/${product.id}/edit`} className="btn-primary flex-1">
              <Edit3 size={16} />
              Edit product
            </Link>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-danger/30 bg-danger-soft px-5 py-2.5 text-sm font-semibold text-danger transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white active:scale-[0.97]"
            >
              <Trash2 size={16} />
              Delete product
            </button>
          </div>
          <Link
            href={`/product/${product.id}`}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-ink-soft hover:text-ink"
          >
            <ExternalLink size={13} />
            See how buyers view this product
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Description</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
            {product.description || "No description yet."}
          </p>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Specifications</h2>
          {specs.length === 0 ? (
            <p className="mt-2 text-sm text-ink-faint">No specifications.</p>
          ) : (
            <dl className="mt-3 flex flex-col divide-y divide-border">
              {specs.map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-2 py-2 text-sm">
                  <dt className="text-ink-faint">{key}</dt>
                  <dd className="text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      </div>

      <section className="card mt-5 p-5 sm:p-6">
        <h2 className="font-display text-base font-semibold text-ink">Ratings & reviews</h2>

        {reviews.length === 0 ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-6 text-center">
            <MessageSquare size={24} className="text-ink-faint" />
            <p className="text-sm text-ink-soft">No ratings yet.</p>
            <p className="max-w-xs text-xs text-ink-faint">
              Buyers can rate this product after their order is completed and the payment is released to you.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-6 sm:grid-cols-[180px_1fr]">
            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <span className="font-display text-4xl font-bold text-ink">{Number(product.rating).toFixed(1)}</span>
                <span className="pb-1.5 text-sm text-ink-faint">/ 5</span>
              </div>
              <p className="-mt-2 text-xs text-ink-soft">
                from {ratingCount} rating{ratingCount === 1 ? "" : "s"}
              </p>
              <div className="flex flex-col gap-1.5">
                {distribution.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2 text-xs text-ink-soft">
                    <span className="w-3 text-right">{star}</span>
                    <Star size={11} className="fill-seal text-seal" />
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-seal"
                        style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-5 text-right text-ink-faint">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {reviews.map((r) => (
                <div key={r.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{r.buyerName || "Buyer"}</span>
                    <RatingStars rating={r.rating} />
                    <span className="ml-auto text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-ink-soft">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <DeleteProductModal
        productName={product.name}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
