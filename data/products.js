import { productService } from "@/services/ProductService";

// function imagesFor(id, count = 3) {
//   return Array.from(
//     { length: count },
//     (_, i) => `https://picsum.photos/seed/chainshop-${id}-${i}/700/700`,
//   );
// }

export const products = [];

export async function fetchProducts() {
  try {
    const res = await productService.GetAllProduct();
    const fetchedData = res.data || [];
    // console.log("Response dari API:", fetchedData);

    products.length = 0;

    products.push(...fetchedData);

    return products;
  } catch (err) {
    console.error("Fetch Products Failed:", err);
    return [];
  }
}

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

export function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts({ category, query } = {}) {
  let result = products;
  if (category && category !== "all") {
    result = result.filter((p) => p.category === category);
  }
  if (query && query.trim().length > 0) {
    const q = query.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }
  return result;
}
