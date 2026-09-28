"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { BackButton } from "@/components/ui/BackButton";
import { ProductForm } from "@/components/seller/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const { user, isSeller, hydrated } = useAuth();
  const { getProduct, updateProduct } = useProducts();
  const router = useRouter();

  const [done, setDone] = useState(false);

  const product = hydrated ? getProduct(id) : null;
  const ownsProduct = product && product.sellerWallet === user?.walletAddress;

  // Redirect buyers, non-owners, and unknown product ids straight back.
  useEffect(() => {
    if (!hydrated) return;
    if (!isSeller || !product || !ownsProduct) router.replace("/seller");
  }, [hydrated, isSeller, product, ownsProduct, router]);

  if (!hydrated || !isSeller || !product || !ownsProduct) return null;

  function handleSubmit(values) {
    // Simulated async update — swap for a PATCH /api/products/:id call once
    // the Postgres-backed API branch is merged in.
    return new Promise((resolve) => {
      window.setTimeout(() => {
        updateProduct(product.id, values);
        setDone(true);
        resolve();
      }, 700);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />

      {done ? (
        <div className="card mt-4 flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="font-display text-xl font-semibold text-ink">
            Changes saved!
          </h1>
          <p className="max-w-xs text-sm text-ink-soft">
            <span className="font-semibold text-ink">{product.name}</span> has
            been updated.
          </p>
          <div className="mt-2 flex gap-3">
            <button type="button" onClick={() => setDone(false)} className="btn-secondary">
              Keep editing
            </button>
            <Link href="/seller" className="btn-primary">
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4 mt-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seal-soft text-seal-dark">
              <Save size={18} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">
                Edit product
              </h1>
              <p className="text-xs text-ink-faint">
                Update stock, price, description, or anything else — all
                fields stay required.
              </p>
            </div>
          </div>

          <ProductForm
            initialValues={{
              name: product.name,
              category: product.category,
              price: String(product.price),
              stock: String(product.stock),
              description: product.description,
              image: product.images?.[0] ?? null,
            }}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            submitPendingLabel="Saving…"
            submitIcon={Save}
            cancelHref="/seller"
          />
        </>
      )}
    </div>
  );
}
