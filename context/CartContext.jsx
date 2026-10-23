"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { cartService } from "@/services/CartService";
import { getApiErrorMessage } from "@/lib/axios";

const CartContext = createContext(null);
const STORAGE_KEY = "chainshop_cart";

// bentuk item cart dari API -> bentuk yang dipakai komponen
function mapCartItem(it) {
  return {
    id: it.productId,
    cartId: it.id,
    name: it.productName,
    image: it.image,
    price: it.price,
    qty: it.qty,
    stock: it.stock,
    selected: it.isSelected,
    sellerId: it.sellerId,
    shopName: it.shopName,
  };
}

export function CartProvider({ children }) {
  const { user, hydrated: authHydrated } = useAuth();
  const userId = user?.userId;

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [bump, setBump] = useState(0); // triggers the cart-icon bump animation

  const loadCart = useCallback(async () => {
    if (!userId) return [];
    try {
      const res = await cartService.GetCart(userId);
      const mapped = (res.data || []).map(mapCartItem);
      setItems(mapped);
      return mapped;
    } catch (error) {
      console.error("Load cart failed:", error);
      return [];
    }
  }, [userId]);

  // guest -> localStorage, login -> cart dari backend
  useEffect(() => {
    if (!authHydrated) return;

    async function init() {
      if (!userId) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          setItems(raw ? JSON.parse(raw) : []);
        } catch (e) {
          setItems([]);
        }
        setHydrated(true);
        return;
      }

      // pindahkan isi cart guest ke cart user setelah login
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const guestItems = raw ? JSON.parse(raw) : [];
        for (const it of guestItems) {
          for (let i = 0; i < it.qty; i++) {
            await cartService.AddToCart(userId, it.id);
          }
        }
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore sync failures, cart user tetap dimuat
      }

      await loadCart();
      setHydrated(true);
    }

    setHydrated(false);
    init();
  }, [authHydrated, userId, loadCart]);

  useEffect(() => {
    if (!hydrated || userId) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore write failures
    }
  }, [items, hydrated, userId]);

  async function addItem(product, qty = 1) {
    if (!userId) {
      setItems((prev) => {
        const existing = prev.find((it) => it.id === product.id);
        if (existing) {
          return prev.map((it) =>
            it.id === product.id ? { ...it, qty: it.qty + qty } : it,
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            image: product.slug,
            price: product.price,
            category: product.category,
            qty,
            selected: true,
          },
        ];
      });
      setBump((b) => b + 1);
      return true;
    }

    try {
      const existingQty = items.find((it) => it.id === product.id)?.qty ?? 0;
      const res = await cartService.AddToCart(userId, product.id);
      if (!res.status) {
        alert(res.message);
        return false;
      }

      if (qty > 1) {
        const fresh = await loadCart();
        const line = fresh.find((it) => it.id === product.id);
        if (line) {
          const upd = await cartService.UpdateCart(userId, {
            cartId: line.cartId,
            quantity: existingQty + qty,
            isSelected: true,
          });
          if (!upd.status) alert(upd.message);
        }
      }

      await loadCart();
      setBump((b) => b + 1);
      return true;
    } catch (error) {
      alert(getApiErrorMessage(error, "Gagal menambahkan ke cart."));
      return false;
    }
  }

  async function removeItem(id) {
    const line = items.find((it) => it.id === id);
    setItems((prev) => prev.filter((it) => it.id !== id));
    if (!userId || !line) return;

    try {
      await cartService.RemoveCart(userId, line.cartId);
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
    await loadCart();
  }

  async function setQty(id, qty) {
    const line = items.find((it) => it.id === id);
    // const nextQty = Math.max(1, qty);
    // setItems((prev) =>
    //   prev.map((it) => (it.id === id ? { ...it, qty: nextQty } : it)),
    // );
    if (!userId || !line) return;

    try {
      const res = await cartService.UpdateCart(userId, {
        cartId: line.cartId,
        quantity: qty,
      });
      if (!res.status) alert(res.message);
    } catch (error) {
      alert(getApiErrorMessage(error));
    }
    await loadCart();
  }

  async function setSelected(lines) {
    // lines: [{ id, selected }]
    setItems((prev) =>
      prev.map((it) => {
        const found = lines.find((l) => l.id === it.id);
        return found ? { ...it, selected: found.selected } : it;
      }),
    );
    if (!userId) return;

    try {
      await Promise.all(
        lines
          .map((l) => ({ ...l, line: items.find((it) => it.id === l.id) }))
          .filter((l) => l.line)
          .map((l) =>
            cartService.SelectCart(userId, l.line.cartId, l.selected),
          ),
      );
    } catch (error) {
      alert(getApiErrorMessage(error));
      await loadCart();
    }
  }

  function toggleSelect(id) {
    const line = items.find((it) => it.id === id);
    if (line) return setSelected([{ id, selected: !line.selected }]);
  }

  function selectAll(value) {
    return setSelected(items.map((it) => ({ id: it.id, selected: value })));
  }

  // Selects exactly one line item (used by "Buy Now") so checkout only
  // includes that product, regardless of what else is sitting in the cart.
  async function selectOnly(id) {
    if (!userId) {
      setItems((prev) => prev.map((it) => ({ ...it, selected: it.id === id })));
      return;
    }
    const fresh = await loadCart();
    setItems(fresh.map((it) => ({ ...it, selected: it.id === id })));
    await Promise.all(
      fresh
        .filter((it) => it.selected !== (it.id === id))
        .map((it) => cartService.SelectCart(userId, it.cartId, it.id === id)),
    );
  }

  // Checkout di backend sudah menghapus item yang dibayar dari cart,
  // jadi cukup muat ulang cart dari server.
  async function checkoutSelected() {
    const selected = items.filter((it) => it.selected);
    if (userId) await loadCart();
    else setItems((prev) => prev.filter((it) => !it.selected));
    return selected;
  }

  const selectedItems = useMemo(
    () => items.filter((it) => it.selected),
    [items],
  );
  const totalCount = useMemo(
    () => items.reduce((sum, it) => sum + it.qty, 0),
    [items],
  );
  const selectedCount = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty, 0),
    [selectedItems],
  );
  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems],
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
        refreshCart: loadCart,
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
