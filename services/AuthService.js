import api from "@/lib/axios";

// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// export interface RegisterPayload {
//   email: string;
//   password: string;
//   confirmPassword: string;
//   fullName: string;
// }

export const authService = {
  login: async (data) => {
    const response = await api.post("/Auth/login", data);
    return response.data;
  },

  loginWithWallet: async (data) => {
    const response = await api.post("/Auth/wallet-login", data.walletAddress);
    return response.data;
  },
};
