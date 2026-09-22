import api from "@/lib/axios";

export const categoryService = {
  GetAllCategory: async () => {
    const response = await api.get("/Category/get-all");
    return response.data;
  },

  AddCategory: async (data) => {
    const response = await api.post("/Category/add", data);
    return response.data;
  },
};
