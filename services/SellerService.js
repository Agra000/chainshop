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

  GetSellerDashboard: async (sellerId) => {
    const response = await api.get("/Seller/dashboard", {
      params: { sellerId },
    });
    return response.data;
  },

  // data: { shopName, image, shopDescription, city } -> foto lama di storage dihapus backend jika diganti
  UpdateShop: async (sellerId, data) => {
    const response = await api.put("/Seller/update", data, {
      params: { sellerId },
    });
    return response.data;
  },

  DeleteStore: async (sellerId) => {
    const response = await api.delete("/Seller/delete", {
      params: { sellerId },
    });
    return response.data;
  },
};
