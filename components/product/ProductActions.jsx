"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function ProductActions({ product }) {
  const { addItem, selectOnly } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function clamp(n) {
    return Math.min(Math.max(1, n), product.stock);
  }

  function handleAddToCart() {
    addItem(product, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    addItem(product, qty);
    selectOnly(product.id);
    router.push("/payment");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-soft">Quantity</span>
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper hover:text-ink active:scale-90"
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>
          <span className="w-10 text-center text-sm font-medium text-ink">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => clamp(q + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-paper hover:text-ink active:scale-90"
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
        <span className="text-xs text-ink-faint">{product.stock} available</span>
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button type="button" onClick={handleAddToCart} className="btn-secondary flex-1">
          {added ? <Check size={17} /> : <ShoppingCart size={17} />}
          {added ? "Added to cart" : "Add to cart"}
        </button>
        <button type="button" onClick={handleBuyNow} className="btn-primary flex-1">
          <Zap size={17} />
          Buy now
        </button>
      </div>
    </div>
  );
}
