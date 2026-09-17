"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { generateOrderId, generateTxHash } from "@/lib/format";

const TransactionContext = createContext(null);
const STORAGE_KEY = "chainshop_transactions";

export const ORDER_STAGES = [
  "Order Placed",
  "Packed at Warehouse",
  "Picked Up by Courier",
  "On the Way",
  "Arrived at Destination",
  "Completed",
];

const ARRIVED_INDEX = ORDER_STAGES.indexOf("Arrived at Destination");
const COMPLETED_INDEX = ORDER_STAGES.indexOf("Completed");

const COURIERS = ["JetTrack Express", "CepatKirim Logistics", "Nusantara Cargo"];

function randomCourier() {
  const name = COURIERS[Math.floor(Math.random() * COURIERS.length)];
  const trackingNumber = `${name.slice(0, 2).toUpperCase()}${Math.floor(
    100000000 + Math.random() * 899999999
  )}ID`;
  return { name, trackingNumber };
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTransactions(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      // ignore write failures
    }
  }, [transactions, hydrated]);

  function createTransaction({ items, subtotal, shippingFee, gasFee, total, paymentMethod }) {
    const now = new Date().toISOString();
    const tx = {
      id: generateOrderId(),
      items,
      subtotal,
      shippingFee,
      gasFee,
      total,
      paymentMethod,
      stageIndex: 0,
      stageTimestamps: ORDER_STAGES.map((_, i) => (i === 0 ? now : null)),
      createdAt: now,
      updatedAt: now,
      courier: randomCourier(),
      escrow: {
        locked: true,
        lockTxHash: generateTxHash(),
        releasedAt: null,
        releaseTxHash: null,
      },
    };
    setTransactions((prev) => [tx, ...prev]);
    return tx;
  }

  // Demo helper: moves a transaction one delivery stage forward, stopping
  // at "Arrived at Destination" — the buyer has to confirm receipt from
  // there, same as in the real flow.
  function advanceStage(id) {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        if (tx.stageIndex >= ARRIVED_INDEX) return tx;
        const nextIndex = tx.stageIndex + 1;
        const now = new Date().toISOString();
        const stageTimestamps = [...tx.stageTimestamps];
        stageTimestamps[nextIndex] = now;
        return { ...tx, stageIndex: nextIndex, updatedAt: now, stageTimestamps };
      })
    );
  }

  // Buyer confirms the parcel arrived in good condition. This is the
  // moment the (dummy, for now) escrow contract would release funds to
  // the seller.
  function confirmReceived(id) {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id || tx.stageIndex !== ARRIVED_INDEX) return tx;
        const now = new Date().toISOString();
        const stageTimestamps = [...tx.stageTimestamps];
        stageTimestamps[COMPLETED_INDEX] = now;
        return {
          ...tx,
          stageIndex: COMPLETED_INDEX,
          updatedAt: now,
          stageTimestamps,
          escrow: {
            ...tx.escrow,
            locked: false,
            releasedAt: new Date().toISOString(),
            releaseTxHash: generateTxHash(),
          },
        };
      })
    );
  }

  function getTransaction(id) {
    return transactions.find((tx) => tx.id === id) || null;
  }

  const ongoing = transactions.filter((tx) => tx.stageIndex < COMPLETED_INDEX);
  const completed = transactions.filter((tx) => tx.stageIndex === COMPLETED_INDEX);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        ongoing,
        completed,
        createTransaction,
        advanceStage,
        confirmReceived,
        getTransaction,
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
