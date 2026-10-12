import api from "@/lib/axios";

export const productService = {
  GetAllProduct: async () => {
    const response = await api.get("/Product/get-all");
    return response.data;
  },

  // params: { keyword, categoryId, categorySlug, minPrice, maxPrice, sortBy }
  SearchProduct: async (params) => {
    const response = await api.get("/Product/search", { params });
    return response.data;
  },

  GetProductDetail: async (productId) => {
    const response = await api.get("/Product/detail", {
      params: { productId },
    });
    return response.data;
  },

  GetProductBySeller: async (sellerId) => {
    const response = await api.get("/Product/get-by-seller", {
      params: { sellerId },
    });
    return response.data;
  },

  AddProduct: async (sellerId, data) => {
    const response = await api.post("/Product/upsert", data, {
      params: { sellerId },
    });
    return response.data;
  },

  UpdateProduct: async (sellerId, productId, data) => {
    const response = await api.put("/Product/update", data, {
      params: { sellerId, productId },
    });
    return response.data;
  },
};
