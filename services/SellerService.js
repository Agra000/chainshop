import api from "@/lib/axios";

export const sellerservice = {
  becomeSeller: async (userId, data) => {
    const response = await api.post("/Seller/become-seller", data, {
      params: { userId },
    });
    console.log(response);
    return response.data;
  },
};
