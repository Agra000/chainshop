"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { sellerservice } from "@/services/SellerService";

// Satu sumber data untuk semua badge notifikasi order seller (avatar navbar, dropdown Toko Saya,
// kartu "Orders received"), supaya angkanya selalu sama di semua tempat.
const POLL_MS = 30_000;

const EMPTY = { newOrders: 0, refundRequested: 0, returnArrived: 0, readyToClaim: 0, total: 0 };

const SellerNotificationContext = createContext(null);

export function SellerNotificationProvider({ children }) {
  const { user, hydrated } = useAuth();
  const storeId = user?.storeId || null;
  const pathname = usePathname();
  const [counts, setCounts] = useState(EMPTY);
  const requestId = useRef(0);

  const refreshSellerNotifications = useCallback(async () => {
    if (!storeId) {
      setCounts(EMPTY);
      return EMPTY;
    }
    const id = ++requestId.current;
    try {
      const res = await sellerservice.GetOrderNotifications(storeId);
      if (!res?.status || id !== requestId.current) return null; // abaikan respons lama yang datang terlambat
      const next = {
        newOrders: res.newOrders ?? 0,
        refundRequested: res.refundRequested ?? 0,
        returnArrived: res.returnArrived ?? 0,
        readyToClaim: res.readyToClaim ?? 0,
        total: res.total ?? 0,
      };
      setCounts(next);
      return next;
    } catch (error) {
      return null; // biarkan angka terakhir; dicoba lagi di polling berikutnya
    }
  }, [storeId]);

  // muat saat login sebagai seller + setiap pindah halaman
  useEffect(() => {
    if (!hydrated) return;
    refreshSellerNotifications();
  }, [hydrated, refreshSellerNotifications, pathname]);

  // polling berkala + muat ulang saat tab kembali aktif
  useEffect(() => {
    if (!storeId) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refreshSellerNotifications();
    }, POLL_MS);
    function onVisible() {
      if (document.visibilityState === "visible") refreshSellerNotifications();
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [storeId, refreshSellerNotifications]);

  return (
    <SellerNotificationContext.Provider value={{ ...counts, refreshSellerNotifications }}>
      {children}
    </SellerNotificationContext.Provider>
  );
}

export function useSellerNotifications() {
  const ctx = useContext(SellerNotificationContext);
  if (!ctx) throw new Error("useSellerNotifications must be used within SellerNotificationProvider");
  return ctx;
}
