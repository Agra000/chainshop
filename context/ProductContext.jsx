"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext(null);
const STORAGE_KEY = "chainshop_seller_products";

function generateProductId() {
  return `sp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProducts(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      // ignore write failures (e.g. private browsing)
    }
  }, [products, hydrated]);

  /**
   * Create a new product listing.
   * `data` shape: { name, category, price, stock, description, images,
   * seller, sellerWallet, location }
   *
   * This persists to localStorage for now, standing in for a real backend.
   * Once the Postgres-backed API is merged, swap the body for a
   * `POST /api/products` call and keep this same signature so callers
   * (the add-product page) don't need to change.
   */
  function createProduct(data) {
    const now = new Date().toISOString();
    const product = {
      id: generateProductId(),
      rating: 0,
      sold: 0,
      createdAt: now,
      ...data,
    };
    setProducts((prev) => [product, ...prev]);
    return product;
  }

  /**
   * Update an existing product listing (name, category, price, stock,
   * description, images, ...). Same localStorage-now/API-later story as
   * `createProduct` — swap the body for a `PATCH /api/products/:id` call
   * once the backend is merged in.
   */
  function updateProduct(id, data) {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      )
    );
  }

  function deleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function getProduct(id) {
    return products.find((p) => p.id === id) || null;
  }

  function getSellerProducts(sellerWallet) {
    return products.filter((p) => p.sellerWallet === sellerWallet);
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        createProduct,
        updateProduct,
        deleteProduct,
        getProduct,
        getSellerProducts,
        hydrated,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
}
