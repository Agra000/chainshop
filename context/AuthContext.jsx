"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { generateWalletAddress } from "@/lib/format";

const AuthContext = createContext(null);
const STORAGE_KEY = "chainshop_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore write failures (e.g. private browsing)
    }
  }, [user, hydrated]);

  function login({ name, email }) {
    setUser({
      name: name?.trim() || "ChainShop User",
      email: email?.trim() || "",
      walletAddress: generateWalletAddress(),
      avatarSeed: `${Date.now()}`,
      phone: "",
      address: "",
      joinedAt: new Date().toISOString(),
      authMethod: "email",
      shop: null, // null = not yet a seller
    });
  }

  function loginWithWallet() {
    const address = generateWalletAddress();
    setUser({
      name: `Wallet User`,
      email: "",
      walletAddress: address,
      avatarSeed: address,
      phone: "",
      address: "",
      joinedAt: new Date().toISOString(),
      authMethod: "wallet",
      shop: null,
    });
  }

  function logout() {
    setUser(null);
  }

  function updateProfile(partial) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  /**
   * Register the current user as a seller.
   * `shopData` shape: { shopName, shopSlug, shopDescription, city, payoutWallet }
   */
  function registerSeller(shopData) {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            shop: {
              ...shopData,
              registeredAt: new Date().toISOString(),
            },
          }
        : prev
    );
  }

  /**
   * Update an existing seller's shop details (same shape as registerSeller).
   */
  function updateShop(partial) {
    setUser((prev) =>
      prev && prev.shop
        ? { ...prev, shop: { ...prev.shop, ...partial } }
        : prev
    );
  }

  /**
   * Permanently delete the seller's shop, reverting the user back to a
   * regular buyer. Equivalent to "unregister seller".
   */
  function deleteShop() {
    setUser((prev) => (prev ? { ...prev, shop: null } : prev));
  }

  const isSeller = !!user?.shop;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isSeller,
        login,
        loginWithWallet,
        logout,
        updateProfile,
        registerSeller,
        updateShop,
        deleteShop,
        hydrated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
