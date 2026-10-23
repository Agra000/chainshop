"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Ban } from "lucide-react";
import { useState } from "react";
import { formatUSDT } from "@/lib/format";
import { RatingStars } from "@/components/common/RatingStars";
import { useCart } from "@/context/CartContext";

function formatSold(sold) {
  if (sold >= 1000)
    return `${(sold / 1000).toFixed(sold % 1000 === 0 ? 0 : 1)}k sold`;
  return `${sold} sold`;
}

export function ProductCard({ product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const outOfStock = (Number(product.stock) || 0) <= 0;

  async function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const ok = await addItem(product, 1);
    if (!ok) return;
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ink/10 hover:shadow-lg hover:shadow-ink/5"
    >
      <div className="relative aspect-square overflow-hidden bg-paper">
        <Image
          src={product.slug}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className={`object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06] ${
            outOfStock ? "opacity-60 grayscale" : ""
          }`}
        />
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            Stok habis
          </span>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          aria-label={
            outOfStock
              ? `${product.name} is out of stock`
              : `Add ${product.name} to cart`
          }
          title={outOfStock ? "Stok habis" : undefined}
          className={`absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-200 ease-out active:scale-90 disabled:cursor-not-allowed disabled:bg-border disabled:text-ink-faint disabled:shadow-none disabled:active:scale-100 ${
            justAdded
              ? "bg-ledger text-white"
              : "bg-surface text-ink hover:bg-navbar hover:text-white"
          }`}
        >
          {outOfStock ? <Ban size={16} /> : justAdded ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-ink">
          {product.name}
        </p>
        <p className="font-display text-base font-semibold text-navbar">
          {formatUSDT(product.price)}
        </p>
        <div className="mt-auto flex items-center justify-between pt-1">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-ink-faint">
            {formatSold(product.sold)}
          </span>
        </div>
      </div>
    </Link>
  );
}
