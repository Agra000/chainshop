"use client";

import { getProductById } from "@/data/products";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "chainshop_cart";
const SELLER_PRODUCTS_KEY = "chainshop_seller_products";

// Cart lines are snapshots saved in localStorage, so their price can go stale
// (e.g. old Rupiah prices from before the switch to USDT). Re-read the current
// price/name/image from the catalog whenever the cart is loaded.
function refreshFromCatalog(items) {
  let sellerProducts = [];
  try {
    sellerProducts = JSON.parse(window.localStorage.getItem(SELLER_PRODUCTS_KEY) || "[]");
  } catch (e) {
    // ignore corrupted storage
  }
  return items.map((it) => {
    const current =
      getProductById(it.id) || sellerProducts.find((p) => p.id === it.id);
    if (!current) return it;
    return {
      ...it,
      name: current.name,
      image: current.images?.[0] ?? it.image,
      price: current.price,
      category: current.category,
    };
  });
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [bump, setBump] = useState(0); // triggers the cart-icon bump animation

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(refreshFromCatalog(JSON.parse(raw)));
    } catch (e) {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore write failures
    }
  }, [items, hydrated]);

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: it.qty + qty } : it
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.images?.[0],
          price: product.price,
          category: product.category,
          qty,
          selected: true,
        },
      ];
    });
    setBump((b) => b + 1);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function setQty(id, qty) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it))
    );
  }

  function toggleSelect(id) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, selected: !it.selected } : it))
    );
  }

  function selectAll(value) {
    setItems((prev) => prev.map((it) => ({ ...it, selected: value })));
  }

  // Selects exactly one line item (used by "Buy Now") so checkout only
  // includes that product, regardless of what else is sitting in the cart.
  function selectOnly(id) {
    setItems((prev) => prev.map((it) => ({ ...it, selected: it.id === id })));
  }

  // Removes the currently-selected items from the cart and returns a
  // snapshot of them, used right after a successful payment.
  function checkoutSelected() {
    const selected = items.filter((it) => it.selected);
    setItems((prev) => prev.filter((it) => !it.selected));
    return selected;
  }

  const selectedItems = useMemo(() => items.filter((it) => it.selected), [items]);
  const totalCount = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);
  const selectedCount = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty, 0),
    [selectedItems]
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        selectedItems,
        addItem,
        removeItem,
        setQty,
        toggleSelect,
        selectAll,
        selectOnly,
        checkoutSelected,
        totalCount,
        selectedCount,
        selectedSubtotal,
        bump,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
