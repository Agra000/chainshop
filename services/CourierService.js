import api from "@/lib/axios";

export const courierService = {
  GetAllCourier: async () => {
    const response = await api.get("/Courier/get-all");
    return response.data;
  },

  GetDrivers: async (courierCompanyId) => {
    const response = await api.get("/Courier/get-drivers", {
      params: { courierCompanyId },
    });
    return response.data;
  },
};
