import api from "@/lib/axios";

export const orderService = {
  // ===== Buyer =====

  // rincian per seller (harga barang, ongkir, estimasi gas ±) dari cart yang dipilih
  CheckoutPreview: async (userId) => {
    const response = await api.get("/Order/checkout-preview", {
      params: { userId },
    });
    return response.data;
  },

  // data: { addressId, paymentMethod } -> 1 order per seller + data untuk deposit onchain
  Checkout: async (userId, data) => {
    const response = await api.post("/Order/checkout", data, {
      params: { userId },
    });
    return response.data;
  },

  // data: { txHash, walletAddress } -> tx deposit() di smart contract escrow
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

  // data: { txHash, walletAddress, note } -> tx release() dari wallet buyer (dana cair ke seller)
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

  // data: { txHash, note } -> tx refund() oleh seller sebelum kirim (semua dana kembali ke buyer)
  RejectOrder: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/reject", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // data: { driverId } -> nomor resi + invoice id di-generate backend, return data invoice untuk markShipped()
  PrepareShipment: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/prepare-shipment", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // data: { invoiceTxHash } -> tx markShipped() (invoice tercatat onchain)
  ShipOrder: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/ship", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // v3: seller sudah mengirim releaseWithAcceptance -> data: { txHash }
  ClaimPayment: async (sellerId, orderId, data) => {
    const response = await api.post("/Order/claim-payment", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // data: { status: "in_transit" | "delivered", note, location } (mock, off-chain, tanpa MetaMask)
  UpdateShipping: async (sellerId, orderId, data) => {
    const response = await api.put("/Order/update-shipping", data, {
      params: { sellerId, orderId },
    });
    return response.data;
  },

  // ===== Buyer / Seller / Admin =====

  // sinkronkan status order dengan smart contract setelah aksi onchain (txHash opsional)
  Sync: async (orderId, txHash) => {
    const response = await api.post("/Order/sync", { txHash: txHash || null }, {
      params: { orderId },
    });
    return response.data;
  },

  // jalankan aksi otomatis yang sudah jatuh tempo sekarang (gas dibayar wallet operator backend)
  RunAuto: async (orderId) => {
    const response = await api.post("/Order/run-auto", null, {
      params: { orderId },
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
