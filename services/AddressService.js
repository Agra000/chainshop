import api from "@/lib/axios";

export const addressService = {
  GetAddresses: async (userId) => {
    const response = await api.get("/Address/get-all", {
      params: { userId },
    });
    return response.data;
  },

  // data: { id?, label, recipientName, phone, fullAddress, city, province, postalCode, isDefault }
  UpsertAddress: async (userId, data) => {
    const response = await api.post("/Address/upsert", data, {
      params: { userId },
    });
    return response.data;
  },

  SetDefaultAddress: async (userId, addressId) => {
    const response = await api.put("/Address/set-default", null, {
      params: { userId, addressId },
    });
    return response.data;
  },

  DeleteAddress: async (userId, addressId) => {
    const response = await api.delete("/Address/delete", {
      params: { userId, addressId },
    });
    return response.data;
  },
};
