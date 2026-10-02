"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PackagePlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { BackButton } from "@/components/ui/BackButton";
import { ProductForm } from "@/components/seller/ProductForm";
import { sellerservice } from "@/services/SellerService";

export default function AddProductPage() {
  const { user, isSeller, hydrated } = useAuth();
  const { createProduct } = useProducts();
  const router = useRouter();
  const [shop, setShop] = useState([]);

  const [done, setDone] = useState(false);
  const [lastName, setLastName] = useState("");
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (!hydrated) return;

    if (user === null) {
      router.replace("/");
    }
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user?.storeId) return;

    async function loadData() {
      const res = await sellerservice.GetSellerInfo(user.storeId);
      setShop(res);
    }

    loadData();
  }, [user?.storeId]);

  function handleSubmit(values) {
    // Simulated async create — swap for a POST /api/products call once the
    // Postgres-backed API branch is merged in.
    return new Promise((resolve) => {
      window.setTimeout(() => {
        createProduct({
          ...values,
          seller: shop.shopName,
          sellerWallet: user.walletAddress,
          location: shop.city || "",
        });
        setLastName(values.name);
        setDone(true);
        resolve();
      }, 700);
    });
  }

  function handleAddAnother() {
    setFormKey((k) => k + 1);
    setDone(false);
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
            Product listed!
          </h1>
          <p className="max-w-xs text-sm text-ink-soft">
            <span className="font-semibold text-ink">{lastName}</span> is now
            live in your shop.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={handleAddAnother}
              className="btn-secondary"
            >
              <PackagePlus size={16} />
              Add another
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
              <PackagePlus size={18} />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold text-ink">
                Add new product
              </h1>
              <p className="text-xs text-ink-faint">
                All fields are required before it can go live.
              </p>
            </div>
          </div>

          <ProductForm
            key={formKey}
            onSubmit={handleSubmit}
            submitLabel="List product"
            submitPendingLabel="Listing…"
            submitIcon={PackagePlus}
            cancelHref="/seller"
          />
        </>
      )}
    </div>
  );
}
