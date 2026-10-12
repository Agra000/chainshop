"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { productService } from "@/services/ProductService";
import { fetchCategories, getCategoryBySlug } from "@/data/categories";
import { getProductById, getSellerProducts as fetchSellerProducts } from "@/data/products";

const ProductContext = createContext(null);

// form ProductForm -> FormItemsRequest backend
async function toProductRequest(data) {
  await fetchCategories();
  const category = getCategoryBySlug(data.category);
  if (!category) throw new Error("Category not found");

  return {
    name: data.name,
    categoryId: category.id,
    priceIdr: data.price,
    stock: data.stock,
    description: data.description,
    image: data.images?.[0] ?? "",
  };
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const loadSellerProducts = useCallback(async (sellerId) => {
    if (!sellerId) return [];
    const data = await fetchSellerProducts(sellerId);
    setProducts(data);
    setHydrated(true);
    return data;
  }, []);

  /**
   * Create a new product listing.
   * `data` shape: { name, category (slug), price, stock, description, images }
   */
  async function createProduct(sellerId, data) {
    const payload = await toProductRequest(data);
    const res = await productService.AddProduct(sellerId, payload);
    if (!res.status) throw new Error(res.message);
    await loadSellerProducts(sellerId);
    return res;
  }

  /**
   * Update an existing product listing (name, category, price, stock,
   * description, images, ...).
   */
  async function updateProduct(sellerId, id, data) {
    const payload = await toProductRequest(data);
    const res = await productService.UpdateProduct(sellerId, id, payload);
    if (!res.status) throw new Error(res.message);
    await loadSellerProducts(sellerId);
    return res;
  }

  async function deleteProduct(sellerId, id) {
    const res = await productService.DeleteProduct(sellerId, id);
    if (!res.status) throw new Error(res.message);
    await loadSellerProducts(sellerId);
    return res;
  }

  async function getProduct(id) {
    return getProductById(id);
  }

  function getSellerProducts() {
    return products;
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
        loadSellerProducts,
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
