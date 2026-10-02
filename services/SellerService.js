import api from "@/lib/axios";

export const sellerservice = {
  becomeSeller: async (userId, data) => {
    const response = await api.post("/Seller/become-seller", data, {
      params: { userId },
    });
    return response.data;
  },
  GetSellerInfo: async (sellerId) => {
    const response = await api.post("/Seller/get-info", null, {
    params: { sellerId },
  });
    return response.data;
  },
};
