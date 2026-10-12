import api from "@/lib/axios";

// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface RegisterPayload {
//   email: string;
//   name: string;
//   phone?: string;
//   city?: string;
// }

export const authService = {
  login: async (data) => {
    const response = await api.post("/Auth/login", data);
    return response.data;
  },

  register: async (data) => {
    const response = await api.post("/Auth/register", data);
    return response.data;
  },

  loginWithWallet: async (data) => {
    const response = await api.post("/Auth/wallet-login", JSON.stringify(data.walletAddress));
    return response.data;
  },

  GetUserInfo: async (userId) => {
    const response = await api.get("/Auth/get-user", {
      params: { userId },
    });
    return response.data;
  },

  UpdateProfile: async (userId, data) => {
    const response = await api.put("/Auth/update-profile", data, {
      params: { userId },
    });
    return response.data;
  },
};
