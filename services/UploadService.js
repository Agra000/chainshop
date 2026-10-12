import api from "@/lib/axios";

// CRUD gambar di Supabase Storage (lewat backend). folder: "products" | "shops" | "avatars"
export const uploadService = {
  // Create -> { status, message, url, path }
  UploadImage: async (userId, folder, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/Upload/image", formData, {
      params: { userId, folder },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update: upload file baru + hapus file lama (oldUrl)
  ReplaceImage: async (userId, folder, file, oldUrl) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.put("/Upload/image", formData, {
      params: { userId, folder, oldUrl },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete
  DeleteImage: async (userId, url) => {
    const response = await api.delete("/Upload/image", {
      params: { userId, url },
    });
    return response.data;
  },
};
