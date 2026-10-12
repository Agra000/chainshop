import { productService } from "@/services/ProductService";

// function imagesFor(id, count = 3) {
//   return Array.from(
//     { length: count },
//     (_, i) => `https://picsum.photos/seed/chainshop-${id}-${i}/700/700`,
//   );
// }

export const products = [];

// Samakan bentuk data dari API (GetProductResponse) dengan yang dipakai komponen
export function mapProduct(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.image,
    image: p.image,
    images: p.image ? [p.image] : [],
    price: p.price,
    stock: p.stock,
    sold: p.sold ?? 0,
    rating: Number(p.ratingAvg ?? 0),
    category: p.category,
    seller: p.seller,
    description: p.description ?? "",
  };
}

export async function fetchProducts() {
  try {
    const res = await productService.GetAllProduct();
    const fetchedData = (res.data || []).map(mapProduct);
    // console.log("Response dari API:", fetchedData);

    products.length = 0;

    products.push(...fetchedData);

    return products;
  } catch (err) {
    console.error("Fetch Products Failed:", err);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const res = await productService.GetProductDetail(id);
    if (!res.status || !res.data) return null;

    return {
      ...mapProduct(res.data),
      sellerId: res.sellerId,
      location: res.sellerCity || "-",
      sellerRating: Number(res.sellerRating ?? 0),
      ratingCount: res.ratingCount ?? 0,
      specifications: Object.fromEntries(
        (res.specifications || []).map((s) => [s.key, s.value]),
      ),
    };
  } catch (err) {
    console.error("Fetch Product Detail Failed:", err);
    return null;
  }
}

export async function getRelatedProducts(product, limit = 4) {
  if (!product) return [];
  const all = products.length ? products : await fetchProducts();
  return all
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export async function searchProducts({ category, query, sortBy } = {}) {
  try {
    const res = await productService.SearchProduct({
      keyword: query?.trim() || undefined,
      categorySlug: category && category !== "all" ? category : undefined,
      sortBy,
    });
    return (res.data || []).map(mapProduct);
  } catch (err) {
    console.error("Search Products Failed:", err);
    return [];
  }
}

export async function getSellerProducts(sellerId) {
  try {
    const res = await productService.GetProductBySeller(sellerId);
    return (res.data || []).map(mapProduct);
  } catch (err) {
    console.error("Fetch Seller Products Failed:", err);
    return [];
  }
}
