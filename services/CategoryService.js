import api from "@/lib/axios";

export const categoryService = {
  GetAllCategory: async () => {
    const response = await api.get("/Category/get-all");
    return response.data;
  },

  AddCategory: async (userId, data) => {
    const response = await api.post("/Category/add", data, {
      params: { userId },
    });
    return response.data;
  },
};
