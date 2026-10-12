import api from "@/lib/axios";

export const cartService = {
  GetCart: async (userId) => {
    const response = await api.get("/Cart/get-by-user", {
      params: { userId },
    });
    return response.data;
  },

  AddToCart: async (userId, productId) => {
    const response = await api.post("/Cart/upsert", JSON.stringify(productId), {
      params: { userId },
    });
    return response.data;
  },

  // data: { cartId, quantity, isSelected }
  UpdateCart: async (userId, data) => {
    const response = await api.put("/Cart/update", data, {
      params: { userId },
    });
    return response.data;
  },

  SelectCart: async (userId, cartId, isSelected) => {
    const response = await api.put("/Cart/select", null, {
      params: { userId, cartId, isSelected },
    });
    return response.data;
  },

  RemoveCart: async (userId, cartId) => {
    const response = await api.delete("/Cart/remove", {
      params: { userId, cartId },
    });
    return response.data;
  },
};
