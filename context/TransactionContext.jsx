"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/OrderService";
import { cartService } from "@/services/CartService";
import { reviewService } from "@/services/ReviewService";
import { holdEscrow, releaseEscrow } from "@/lib/blockchain";
import { getApiErrorMessage } from "@/lib/axios";

const TransactionContext = createContext(null);
// biaya tambahan (ongkir & gas fee) yang tidak disimpan di backend
const META_STORAGE_KEY = "chainshop_order_meta";

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
  completed: 5,
  cancelled: 0,
};

export const STATUS_LABEL = {
  pending_payment: "Waiting for Payment",
  cancelled: "Cancelled",
};

// backend mengirim "yyyy-MM-dd HH:mm:ss" (UTC)
export function toIsoDate(value) {
  if (!value) return null;
  return value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
}

function readMeta() {
  try {
    return JSON.parse(window.localStorage.getItem(META_STORAGE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}

function saveMeta(orderId, meta) {
  try {
    const all = readMeta();
    all[orderId] = meta;
    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    // ignore write failures
  }
}

function withFees(orderId, subtotal) {
  const meta = readMeta()[orderId] || {};
  const shippingFee = meta.shippingFee ?? 0;
  const gasFee = meta.gasFee ?? 0;
  return { meta, shippingFee, gasFee, total: subtotal + shippingFee + gasFee };
}

// list order (GetOrderResponse) -> bentuk yang dipakai OrderCard
export function mapOrderSummary(o) {
  const { total } = withFees(o.id, o.totalIdr);
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
    total,
    trackingNumber: o.trackingNumber,
    createdAt: toIsoDate(o.createdAt),
  };
}

// detail order (GetOrderDetailResponse) -> bentuk yang dipakai halaman detail
export function mapOrderDetail(d) {
  const { meta, shippingFee, gasFee, total } = withFees(d.orderId, d.totalIdr);
  const stageIndex = STATUS_STAGE[d.orderStatus] ?? 0;

  const stageTimestamps = ORDER_STAGES.map(() => null);
  stageTimestamps[0] = toIsoDate(d.createdAt);
  (d.trackings || []).forEach((t) => {
    if (t.status === "cancelled" || t.status === "pending_payment") return;
    const idx = STATUS_STAGE[t.status];
    if (idx !== undefined && !stageTimestamps[idx]) stageTimestamps[idx] = toIsoDate(t.createdAt);
  });

  const escrows = d.escrowTransactions || [];
  const hold = escrows.find((e) => e.txType === "hold");
  const release = escrows.find((e) => e.txType === "release");
  const refund = escrows.find((e) => e.txType === "refund");

  return {
    id: d.orderId,
    code: d.orderCode,
    status: d.orderStatus,
    statusLabel: STATUS_LABEL[d.orderStatus],
    stageIndex,
    stageTimestamps,
    createdAt: toIsoDate(d.createdAt),
    items: (d.items || []).map((it) => ({
      id: it.productId,
      orderItemId: it.id,
      name: it.productName,
      image: it.image,
      price: it.price,
      qty: it.qty,
      isReviewed: it.isReviewed,
    })),
    subtotal: d.totalIdr,
    shippingFee,
    gasFee,
    total,
    paymentMethod: meta.paymentMethodLabel || d.paymentMethod,
    buyerName: d.buyerName,
    buyerWallet: d.buyerWallet,
    sellerId: d.sellerId,
    shopName: d.shopName,
    sellerWallet: d.sellerWallet,
    address: d.address,
    driver: d.driver,
    invoiceHash: d.invoiceHash,
    invoiceTxHash: d.invoiceTxHash,
    trackings: (d.trackings || []).map((t) => ({ ...t, createdAt: toIsoDate(t.createdAt) })),
    courier: {
      name: d.driver?.courierCompany || "Waiting for courier",
      trackingNumber: d.trackingNumber || "-",
    },
    escrow: {
      locked: !!hold && !release && !refund,
      lockTxHash: hold?.txHash,
      releasedAt: toIsoDate(release?.createdAt || refund?.createdAt),
      releaseTxHash: release?.txHash || refund?.txHash,
      refunded: !!refund,
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
   * Checkout cart yang dipilih -> buat order (per seller) -> bayar ke escrow.
   * Jika pembayaran gagal, order yang belum dibayar dibatalkan dan item
   * dikembalikan ke cart.
   */
  async function createTransaction({ items, addressId, shippingFee, gasFee, paymentMethod, paymentMethodLabel }) {
    const checkout = await orderService.Checkout(userId, { addressId, paymentMethod });
    if (!checkout.status) throw new Error(checkout.message);

    const orders = checkout.data || [];
    const paid = [];

    try {
      for (const [i, order] of orders.entries()) {
        // ongkir & gas fee dicatat di order pertama
        saveMeta(order.orderId, {
          shippingFee: i === 0 ? shippingFee : 0,
          gasFee: i === 0 ? gasFee : 0,
          paymentMethodLabel,
        });

        const tx = await holdEscrow(order, user.walletAddress);
        const res = await orderService.PayOrder(userId, order.orderId, {
          txHash: tx.txHash,
          walletAddress: tx.walletAddress,
        });
        if (!res.status) throw new Error(res.message);
        paid.push(order);
      }
    } catch (error) {
      const unpaid = orders.filter((o) => !paid.includes(o));
      await Promise.all(unpaid.map((o) => orderService.CancelOrder(userId, o.orderId).catch(() => {})));

      // kembalikan item dari order yang batal ke cart
      const unpaidSellers = unpaid.map((o) => o.sellerId);
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
      throw new Error(getApiErrorMessage(error, "Payment failed."));
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

  // Buyer confirms the parcel arrived in good condition -> escrow release
  async function confirmReceived(id) {
    const tx = await getTransaction(id);
    if (!tx) throw new Error("Order not found");

    const onchain = await releaseEscrow({ orderCode: tx.code, totalIdr: tx.subtotal }, user.walletAddress);
    const res = await orderService.ConfirmDelivery(userId, id, {
      txHash: onchain.txHash,
      walletAddress: onchain.walletAddress,
    });
    if (!res.status) throw new Error(res.message);

    await loadTransactions();
    return getTransaction(id);
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

  const ongoing = transactions.filter((tx) => tx.status !== "completed" && tx.status !== "cancelled");
  const completed = transactions.filter((tx) => tx.status === "completed");
  const cancelled = transactions.filter((tx) => tx.status === "cancelled");

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        ongoing,
        completed,
        cancelled,
        createTransaction,
        confirmReceived,
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
