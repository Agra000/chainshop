import api from "@/lib/axios";

export const orderService = {
  // ===== Buyer =====

  // data: { addressId, paymentMethod }
  Checkout: async (userId, data) => {
    const response = await api.post("/Order/checkout", data, {
      params: { userId },
    });
    return response.data;
  },

  // data: { txHash, walletAddress, note } -> escrow hold
  PayOrder: async (userId, orderId, data) => {
    const response = await api.post("/Order/pay", data, {
      params: { userId, orderId },
    });
    return response.data;
  },

  CancelOrder: async (userId, orderId) => {
    const response = await api.post("/Order/cancel", null, {
      params: { userId, orderId },
    });
    return response.data;
  },

  GetMyOrders: async (userId, status) => {
    const response = await api.get("/Order/my-orders", {
      params: { userId, status },
    });
    return response.data;
  },

  // data: { txHash, walletAddress, note } -> escrow release
  ConfirmDelivery: async (userId, orderId, data) => {
    const response = await api.post("/Order/confirm-delivery", data, {
      params: { userId, orderId },
    });
    return response.data;
  },

  // isi salah satu: { userId } untuk buyer atau { sellerId } untuk seller
  GetOrderDetail: async (orderId, { userId, sellerId } = {}) => {
    const response = await api.get("/Order/detail", {
      params: { orderId, userId, sellerId },
    });
    return response.data;
  },

  // ===== Seller =====

  GetSellerOrders: async (sellerId, status) => {
    const response = await api.get("/Order/seller-orders", {
      params: { sellerId, status },
    });
    return response.data;
  },

  ProcessOrder: async (sellerId, orderId) => {
    const response = await api.post("/Order/process", null, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // data: { txHash, note } -> escrow refund
  RejectOrder: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/reject", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  GetShippingInvoice: async (sellerId, orderId, driverId, trackingNumber) => {
    const response = await api.get("/Order/shipping-invoice", {
      params: { sellerId, orderId, driverId, trackingNumber },
    });
    return response.data;
  },

  // data: { driverId, trackingNumber, invoiceTxHash }
  ShipOrder: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/ship", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // data: { status: "in_transit" | "delivered", note, location }
  UpdateShipping: async (sellerId, orderId, data) => {
    const response = await api.put("/Order/update-shipping", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // ===== Public =====

  VerifyInvoice: async (orderId, invoiceHash) => {
    const response = await api.get("/Order/verify-invoice", {
      params: { orderId, invoiceHash },
    });
    return response.data;
  },
};
