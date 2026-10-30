"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap, Check, PackageX } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function ProductActions({ product }) {
  const { addItem, selectOnly } = useCart();
  const router = useRouter();
  const stock = Number(product.stock) || 0;
  const outOfStock = stock <= 0;

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState("");

  function clamp(n) {
    return Math.min(Math.max(1, n), Math.max(1, stock));
  }

  async function handleAddToCart() {
    if (outOfStock || busy) return;
    setBusy("cart");
    try {
      const ok = await addItem(product, qty);
      if (!ok) return;
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setBusy("");
    }
  }

  async function handleBuyNow() {
    if (outOfStock || busy) return;
    setBusy("buy");
    try {
      await selectOnly(product.id);
      router.push("/payment");
    } finally {
      setBusy("");
    }
  }

  if (outOfStock) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3">
          <PackageX size={18} className="shrink-0 text-danger" />
          <div>
            <p className="text-sm font-semibold text-danger-dark">Stok habis</p>
            <p className="text-xs text-ink-soft">
              Produk ini sedang tidak tersedia. Coba cek lagi nanti.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button type="button" disabled className="btn-secondary flex-1">
            <ShoppingCart size={17} />
            Add to cart
          </button>
          <button type="button" disabled className="btn-primary flex-1">
            <PackageX size={17} />
            Out of stock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-soft">Quantity</span>
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q - 1))}
            disabled={qty <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper hover:text-ink active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100"
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-medium text-ink">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q + 1))}
            disabled={qty >= stock}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper hover:text-ink active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100"
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
        <span
          className={`text-xs ${stock <= 5 ? "font-medium text-seal" : "text-ink-faint"}`}
        >
          {stock <= 5 ? `Sisa ${stock} lagi!` : `${stock} available`}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!!busy}
          className="btn-secondary flex-1"
        >
          {added ? <Check size={17} /> : <ShoppingCart size={17} />}
          {added ? "Added to cart" : busy === "cart" ? "Adding…" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!!busy}
          className="btn-primary flex-1"
        >
          <Zap size={17} />
          {busy === "buy" ? "Processing…" : "Buy now"}
        </button>
      </div>
    </div>
  );
}
