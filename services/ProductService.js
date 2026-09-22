import api from "@/lib/axios";

export const productService = {
  GetAllProduct: async () => {
    const response = await api.get("/Product/get-all");
    return response.data;
  },

  AddProduct: async (data) => {
    const response = await api.post("/Product/upsert", data);
    return response.data;
  },
};
