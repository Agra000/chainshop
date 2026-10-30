"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatUSDT } from "@/lib/format";
import { useCart } from "@/context/CartContext";

export function CartItemRow({ item }) {
  const { toggleSelect, setQty, removeItem } = useCart();
  // stock hanya tersedia untuk cart dari backend (user login)
  const hasStock = typeof item.stock === "number";
  const outOfStock = hasStock && item.stock <= 0;
  const atMax = hasStock && item.qty >= item.stock;

  return (
    <div className="flex items-center gap-3 border-b border-border py-4 last:border-b-0 sm:gap-4">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => toggleSelect(item.id)}
        aria-label={`Select ${item.name}`}
        className="h-[18px] w-[18px] shrink-0 accent-ledger"
      />

      <Link href={`/product/${item.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-paper sm:h-20 sm:w-20">
        {item.image && (
          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/product/${item.id}`}
          className="line-clamp-2 text-sm text-ink transition-colors duration-150 hover:text-seal sm:text-[15px]"
        >
          {item.name}
        </Link>
        <p className="mt-1 font-display text-sm font-semibold text-ink sm:text-base">
          {formatUSDT(item.price)}
        </p>
        {outOfStock ? (
          <p className="mt-0.5 text-xs font-medium text-danger">Stok habis</p>
        ) : atMax ? (
          <p className="mt-0.5 text-xs text-ink-faint">Maks. {item.stock} (stok tersisa)</p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty(item.id, item.qty - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper active:scale-90"
            aria-label="Decrease quantity"
          >
            <Minus size={12} />
          </button>
          <span className="w-7 text-center text-xs font-medium text-ink">{item.qty}</span>
          <button
            type="button"
            onClick={() => setQty(item.id, item.qty + 1)}
            disabled={atMax || outOfStock}
            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100"
            aria-label="Increase quantity"
          >
            <Plus size={12} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="flex items-center gap-1 text-xs text-ink-faint transition-colors duration-150 hover:text-danger"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>
    </div>
  );
}
