import api from "@/lib/axios";

export const reviewService = {
  // data: { orderItemId, rating, comment }
  AddReview: async (userId, data) => {
    const response = await api.post("/Review/add", data, {
      params: { userId },
    });
    return response.data;
  },

  GetProductReviews: async (productId) => {
    const response = await api.get("/Review/get-by-product", {
      params: { productId },
    });
    return response.data;
  },
};
