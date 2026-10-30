"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/OrderService";
import { cartService } from "@/services/CartService";
import { reviewService } from "@/services/ReviewService";
import { refundService } from "@/services/RefundService";
import {
  cancelExpiredOnchain,
  depositOrder,
  ensureAllowance,
  getChainErrorMessage,
  signAcceptance,
} from "@/lib/blockchain";
import { getApiErrorMessage } from "@/lib/axios";
import { PAYMENT_METHODS } from "@/components/payment/PaymentMethodSelector";

const TransactionContext = createContext(null);

export const ORDER_STAGES = [
  "Order Placed",
  "Packed at Warehouse",
  "Picked Up by Courier",
  "On the Way",
  "Arrived at Destination",
  "Completed",
];

// status order di backend -> index ORDER_STAGES
export const STATUS_STAGE = {
  pending_payment: 0,
  paid: 0,
  processing: 1,
  shipped: 2,
  in_transit: 3,
  delivered: 4,
  refund_requested: 4,
  return_pending: 4,
  return_shipped: 4,
  return_delivered: 4,
  accepted: 4,
  completed: 5,
  refunded: 5,
  cancelled: 0,
};

export const STATUS_LABEL = {
  pending_payment: "Waiting for Payment",
  paid: "Waiting for Seller",
  processing: "Packing",
  refund_requested: "Refund Requested",
  return_pending: "Return the Item",
  return_shipped: "Return Shipped",
  return_delivered: "Return Arrived",
  accepted: "Accepted · Awaiting Seller Claim",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

// status yang dananya masih tertahan di escrow
export const HELD_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "in_transit",
  "delivered",
  "refund_requested",
  "return_pending",
  "return_shipped",
  "return_delivered",
  "accepted",
];
export const FINISHED_STATUSES = ["completed", "refunded", "cancelled"];
export const REFUND_STATUSES = ["refund_requested", "return_pending", "return_shipped", "return_delivered"];

// backend mengirim "yyyy-MM-dd HH:mm:ss" (UTC)
export function toIsoDate(value) {
  if (!value) return null;
  return value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
}

function stageFor(status, statusBeforeRefund) {
  // refund "barang tak sampai" -> timeline tetap di tahap pengiriman terakhir
  if (status === "refund_requested" && statusBeforeRefund && statusBeforeRefund !== "delivered") {
    return STATUS_STAGE[statusBeforeRefund] ?? 4;
  }
  return STATUS_STAGE[status] ?? 0;
}

function paymentLabel(method) {
  return PAYMENT_METHODS.find((m) => m.id === method)?.label || method;
}

// list order (GetOrderResponse) -> bentuk yang dipakai OrderCard
export function mapOrderSummary(o) {
  return {
    id: o.id,
    code: o.orderCode,
    status: o.status,
    statusLabel: STATUS_LABEL[o.status],
    stageIndex: STATUS_STAGE[o.status] ?? 0,
    items: [{ name: o.orderCode, image: o.firstItemImage }],
    itemCount: o.itemCount,
    buyerName: o.buyerName,
    shopName: o.shopName,
    subtotal: o.totalIdr,
    total: o.totalIdr,
    trackingNumber: o.trackingNumber,
    refundCount: o.refundCount ?? 0,
    createdAt: toIsoDate(o.createdAt),
  };
}

// detail order (GetOrderDetailResponse) -> bentuk yang dipakai halaman detail
export function mapOrderDetail(d) {
  const stageIndex = stageFor(d.orderStatus, d.statusBeforeRefund);

  const stageTimestamps = ORDER_STAGES.map(() => null);
  stageTimestamps[0] = toIsoDate(d.createdAt);
  (d.trackings || []).forEach((t) => {
    if (["cancelled", "pending_payment", "paid"].includes(t.status) || REFUND_STATUSES.includes(t.status)) return;
    const idx = STATUS_STAGE[t.status];
    if (idx !== undefined && !stageTimestamps[idx]) stageTimestamps[idx] = toIsoDate(t.createdAt);
  });

  const escrows = d.escrowTransactions || [];
  const hold = escrows.find((e) => e.txType === "hold");
  const release = escrows.find((e) => e.txType === "release");
  const refund = escrows.find((e) => e.txType === "refund");
  const itemsTotal = d.itemsTotal || (d.items || []).reduce((s, it) => s + it.lineTotal, 0);

  return {
    id: d.orderId,
    code: d.orderCode,
    status: d.orderStatus,
    statusLabel: STATUS_LABEL[d.orderStatus],
    stageIndex,
    stageTimestamps,
    createdAt: toIsoDate(d.createdAt),
    paidAt: toIsoDate(d.paidAt),
    shippedAt: toIsoDate(d.shippedAt),
    deliveredAt: toIsoDate(d.deliveredAt),
    completedAt: toIsoDate(d.completedAt),
    items: (d.items || []).map((it) => ({
      id: it.productId,
      orderItemId: it.id,
      name: it.productName,
      image: it.image,
      price: it.price,
      qty: it.qty,
      lineTotal: it.lineTotal,
      isReviewed: it.isReviewed,
    })),
    itemCount: d.itemCount,
    subtotal: itemsTotal,
    itemsTotal,
    shippingFee: d.shippingFee || 0,
    gasFee: d.gasFeeEstimate || 0,
    total: d.totalIdr,
    paymentMethod: paymentLabel(d.paymentMethod),
    buyerName: d.buyerName,
    buyerWallet: d.buyerWallet,
    sellerId: d.sellerId,
    shopName: d.shopName,
    sellerWallet: d.sellerWallet,
    address: d.address,
    driver: d.driver,
    invoiceId: d.invoiceId,
    invoiceHash: d.invoiceHash,
    invoiceTxHash: d.invoiceTxHash,
    onchainOrderId: d.onchainOrderId,
    escrowAddress: d.escrowAddress,
    explorerUrl: d.explorerUrl,
    sellerDeadlineAt: toIsoDate(d.sellerDeadlineAt),
    buyerDeadlineAt: toIsoDate(d.buyerDeadlineAt),
    returnDeadlineAt: toIsoDate(d.returnDeadlineAt),
    notDeliveredRefundAt: toIsoDate(d.notDeliveredRefundAt),
    refundCount: d.refundCount ?? 0,
    maxRefundRequests: d.maxRefundRequests ?? 3,
    statusBeforeRefund: d.statusBeforeRefund,
    returnTrackingNumber: d.returnTrackingNumber,
    buyerAcceptSignature: d.buyerAcceptSignature,
    acceptedAt: toIsoDate(d.acceptedAt),
    refunds: (d.refunds || []).map((r) => ({
      ...r,
      createdAt: toIsoDate(r.createdAt),
      decidedAt: toIsoDate(r.decidedAt),
    })),
    trackings: (d.trackings || []).map((t) => ({ ...t, createdAt: toIsoDate(t.createdAt) })),
    escrowTransactions: escrows.map((e) => ({ ...e, createdAt: toIsoDate(e.createdAt) })),
    courier: {
      name: d.courierName || d.driver?.courierCompany || "Waiting for courier",
      driverName: d.driver?.fullName,
      trackingNumber: d.trackingNumber || "-",
    },
    escrow: {
      locked: HELD_STATUSES.includes(d.orderStatus),
      lockTxHash: hold?.txHash,
      releasedAt: toIsoDate(release?.createdAt || refund?.createdAt),
      releaseTxHash: release?.txHash || refund?.txHash,
      refunded: d.orderStatus === "refunded" || d.orderStatus === "cancelled",
    },
  };
}

export function TransactionProvider({ children }) {
  const { user, hydrated: authHydrated } = useAuth();
  const userId = user?.userId;

  const [transactions, setTransactions] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  const loadTransactions = useCallback(async () => {
    if (!userId) {
      setTransactions([]);
      return [];
    }
    try {
      const res = await orderService.GetMyOrders(userId);
      const mapped = (res.data || []).map(mapOrderSummary);
      setTransactions(mapped);
      return mapped;
    } catch (error) {
      console.error("Load orders failed:", error);
      return [];
    }
  }, [userId]);

  useEffect(() => {
    if (!authHydrated) return;
    setHydrated(false);
    loadTransactions().finally(() => setHydrated(true));
  }, [authHydrated, loadTransactions]);

  /**
   * Checkout cart yang dipilih -> buat order (1 per seller) -> approve mUSDT sekali
   * -> deposit() ke escrow per order -> verifikasi tx di backend.
   * Jika pembayaran gagal, order yang belum dibayar dibatalkan dan item dikembalikan ke cart.
   * `onStep(text)` dipanggil untuk menampilkan progres di UI.
   */
  async function createTransaction({ items, addressId, paymentMethod, onStep }) {
    const step = (text) => onStep?.(text);

    step("Creating orders…");
    const checkout = await orderService.Checkout(userId, { addressId, paymentMethod });
    if (!checkout.status) throw new Error(checkout.message);

    const orders = checkout.data || [];
    const paid = [];

    try {
      const totalUnits = orders.reduce(
        (sum, o) => sum + BigInt(o.itemsTotalUnits) + BigInt(o.shippingFeeUnits) + BigInt(o.gasFeeUnits),
        0n,
      );

      step("Approve mUSDT in MetaMask…");
      await ensureAllowance(totalUnits, user.walletAddress);

      for (const [i, order] of orders.entries()) {
        step(`Deposit to escrow (${i + 1}/${orders.length}) — confirm in MetaMask…`);
        const tx = await depositOrder(order, user.walletAddress);

        step(`Verifying payment (${i + 1}/${orders.length})…`);
        const res = await orderService.PayOrder(userId, order.orderId, {
          txHash: tx.txHash,
          walletAddress: tx.walletAddress,
        });
        if (!res.status) throw new Error(res.message);
        paid.push(order);
      }
    } catch (error) {
      const unpaid = orders.filter((o) => !paid.includes(o));
      // backend menolak pembatalan jika deposit ternyata sudah masuk onchain (order itu tetap dibayar)
      const cancelResults = await Promise.all(
        unpaid.map((o) =>
          orderService
            .CancelOrder(userId, o.orderId)
            .then((res) => (res?.status ? o : null))
            .catch(() => null),
        ),
      );

      // kembalikan ke cart hanya item dari order yang benar-benar batal
      const unpaidSellers = cancelResults.filter(Boolean).map((o) => o.sellerId);
      for (const it of items.filter((it) => unpaidSellers.includes(it.sellerId))) {
        try {
          await cartService.AddToCart(userId, it.id);
          if (it.qty > 1) {
            const cart = await cartService.GetCart(userId);
            const line = (cart.data || []).find((c) => c.productId === it.id);
            if (line) await cartService.UpdateCart(userId, { cartId: line.id, quantity: it.qty, isSelected: true });
          }
        } catch (e) {
          // ignore
        }
      }

      await loadTransactions();
      throw new Error(getChainErrorMessage(error, getApiErrorMessage(error, "Payment failed.")));
    }

    await loadTransactions();
    return { orders, id: orders[0]?.orderId };
  }

  const getTransaction = useCallback(
    async (id) => {
      if (!userId) return null;
      try {
        const res = await orderService.GetOrderDetail(id, { userId });
        return res.status ? mapOrderDetail(res.data) : null;
      } catch (error) {
        console.error("Load order detail failed:", error);
        return null;
      }
    },
    [userId],
  );

  function ensureOk(res) {
    if (res && res.status === false) throw new Error(res.message);
    return res;
  }

  // Buyer menerima barang -> release() onchain (1 transaksi MetaMask) -> dana cair ke seller
  // v3: buyer cukup menandatangani persetujuan di MetaMask (bukan transaksi, tanpa gas);
  // seller yang nanti mengklaim dana onchain
  async function confirmReceived(tx, onStep) {
    try {
      onStep?.("Sign the acceptance in MetaMask (free, no gas)…");
      const signature = await signAcceptance(tx.onchainOrderId, user.walletAddress);
      onStep?.("Saving acceptance…");
      ensureOk(await orderService.ConfirmDelivery(userId, tx.id, { signature }));
    } catch (error) {
      throw new Error(getChainErrorMessage(error, getApiErrorMessage(error, "Failed to accept the order.")));
    }
    await loadTransactions();
    return getTransaction(tx.id);
  }

  /**
   * Refund (off-chain, tanpa gas): cek kelayakan + tx id invoice -> simpan alasan & foto.
   * data: { reason, photoUrl, invoiceTxHash }
   */
  async function requestRefund(tx, data, onStep) {
    try {
      onStep?.("Verifying invoice transaction…");
      ensureOk(await refundService.Check(userId, tx.id, data.invoiceTxHash.trim()));

      onStep?.("Submitting refund request…");
      ensureOk(
        await refundService.Request(userId, tx.id, {
          reason: data.reason,
          photoUrl: data.photoUrl || null,
          invoiceTxHash: data.invoiceTxHash.trim(),
        }),
      );
    } catch (error) {
      throw new Error(getApiErrorMessage(error, error.message || "Failed to request refund."));
    }
    await loadTransactions();
    return getTransaction(tx.id);
  }

  async function backendAction(tx, call, fallback) {
    try {
      ensureOk(await call());
    } catch (error) {
      throw new Error(getApiErrorMessage(error, error.message || fallback));
    }
    await loadTransactions();
    return getTransaction(tx.id);
  }

  // retur (off-chain, tanpa MetaMask)
  const returnShipped = (tx) => backendAction(tx, () => refundService.ReturnShipped(userId, tx.id), "Failed to record the return.");
  const returnDelivered = (tx) =>
    backendAction(tx, () => refundService.ReturnDelivered(userId, tx.id), "Failed to record the return.");

  // aksi otomatis yang sudah jatuh tempo, dijalankan backend (gas dibayar wallet operator)
  const runAutoAction = (tx) => backendAction(tx, () => orderService.RunAuto(tx.id), "Failed to run the automatic action.");

  // pintu darurat: seller tidak kirim sebelum batas -> buyer membatalkan sendiri onchain, lalu sinkronkan
  async function cancelExpired(tx) {
    try {
      const onchain = await cancelExpiredOnchain(tx.onchainOrderId, user.walletAddress);
      ensureOk(await orderService.Sync(tx.id, onchain.txHash));
    } catch (error) {
      throw new Error(getChainErrorMessage(error, getApiErrorMessage(error, "Failed to cancel the order.")));
    }
    await loadTransactions();
    return getTransaction(tx.id);
  }

  async function syncTransaction(tx) {
    try {
      await orderService.Sync(tx.id);
    } catch (error) {
      // abaikan, tetap muat ulang data
    }
    await loadTransactions();
    return getTransaction(tx.id);
  }

  async function cancelTransaction(id) {
    const res = await orderService.CancelOrder(userId, id);
    if (!res.status) throw new Error(res.message);
    await loadTransactions();
    return res;
  }

  async function rateItem(orderItemId, rating, comment) {
    const res = await reviewService.AddReview(userId, { orderItemId, rating, comment });
    if (!res.status) throw new Error(res.message);
    return res;
  }

  const ongoing = transactions.filter((tx) => !FINISHED_STATUSES.includes(tx.status));
  const completed = transactions.filter((tx) => tx.status === "completed");
  const refunded = transactions.filter((tx) => tx.status === "refunded");
  const cancelled = transactions.filter((tx) => tx.status === "cancelled");

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        ongoing,
        completed,
        refunded,
        cancelled,
        createTransaction,
        confirmReceived,
        requestRefund,
        returnShipped,
        returnDelivered,
        runAutoAction,
        cancelExpired,
        syncTransaction,
        cancelTransaction,
        rateItem,
        getTransaction,
        refreshTransactions: loadTransactions,
        hydrated,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
