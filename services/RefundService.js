import api from "@/lib/axios";

export const refundService = {
  // ===== Buyer =====

  // cek kelayakan + validasi tx id invoice (off-chain, tanpa gas)
  Check: async (userId, orderId, invoiceTxHash) => {
    const response = await api.post("/Refund/check", { invoiceTxHash }, {
      params: { userId, orderId },
    });
    return response.data;
  },

  // data: { reason, photoUrl, invoiceTxHash } -> pengajuan refund off-chain
  Request: async (userId, orderId, data) => {
    const response = await api.post("/Refund/request", data, {
      params: { userId, orderId },
    });
    return response.data;
  },

  // buyer sudah mengirim barang retur (off-chain)
  ReturnShipped: async (userId, orderId) => {
    const response = await api.post("/Refund/return-shipped", null, {
      params: { userId, orderId },
    });
    return response.data;
  },

  // barang retur sampai di seller (off-chain)
  ReturnDelivered: async (userId, orderId) => {
    const response = await api.post("/Refund/return-delivered", null, {
      params: { userId, orderId },
    });
    return response.data;
  },

  // ===== Admin (= arbiter) =====

  AdminList: async (userId, status) => {
    const response = await api.get("/Refund/admin-list", {
      params: { userId, status: status || undefined },
    });
    return response.data;
  },

  AdminDetail: async (userId, refundId) => {
    const response = await api.get("/Refund/admin-detail", {
      params: { userId, refundId },
    });
    return response.data;
  },

  // data: { approve, note, txHash? } -> txHash hanya untuk approve refund "barang tak sampai" (refund() onchain)
  AdminDecide: async (userId, refundId, data) => {
    const response = await api.post("/Refund/admin-decide", data, {
      params: { userId, refundId },
    });
    return response.data;
  },
};
