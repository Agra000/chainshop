"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "@/services/AuthService";
import { sellerservice } from "@/services/SellerService";
import { getApiErrorMessage } from "@/lib/axios";
import {
  clearToken,
  getTokenUserId,
  isTokenValid,
  setToken,
  SESSION_EXPIRED_EVENT,
} from "@/lib/session";

const AuthContext = createContext(null);
const STORAGE_KEY = "chainshop_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  async function getUserInfo(userId = user?.userId) {
    try {
      if (userId) {
        setIsLoading(true);
        const res = await authService.GetUserInfo(userId);
        if (!res.status) return res;

        setUser((prev) => ({
          ...prev,
          userId,
          name: res.username || "User",
          email: res.email,
          phone: res.phone,
          city: res.city,
          authMethod: res.authMethod,
          joinedAt: prev?.joinedAt || res.lastLoginAt || new Date().toISOString(),
          storeId: res.storeId,
          storeName: res.storeName,
          walletAddress: res.walletAddress,
        }));
        return res;
      } else {
        return;
      }
    } catch (error) {
      console.error("GetUserInfo error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hydrated && user?.userId) {
      getUserInfo().catch(() => {});
    }
  }, [hydrated, user?.userId]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : null;
      // user hanya dianggap login jika JWT di cookie masih valid & milik user yang sama
      if (stored && isTokenValid() && getTokenUserId() === stored.userId) {
        setUser(stored);
      } else {
        clearToken();
      }
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

  // token expired / 401 dari backend -> logout otomatis
  useEffect(() => {
    function handleExpired() {
      setUser(null);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  function startSession(res) {
    setToken(res.token, res.expiresAt);
    setUser({
      userId: res.userId,
      email: res.email,
      walletAddress: res.walletAddress,
      joinedAt: new Date().toISOString(),
    });
  }

  // 1. Fungsi Login Berbasis Email / Auth Biasa
  // mode "signup" akan register dulu, lalu langsung login
  async function login({ email, password, name, mode = "login" }) {
    try {
      setIsLoading(true);

      const payload = {
        email: email?.trim(),
        password: password ?? "", // jika backend menggunakan password
        name: name?.trim() || "ChainShop User",
      };

      if (mode === "signup") {
        const reg = await authService.register(payload);
        if (!reg.status) {
          alert(reg.message);
          return reg;
        }
      }

      // Tembak ke API login backend
      const res = await authService.login(payload);
      if (!res.status) {
        alert(res.message);
        return res;
      }

      // Simpan session (JWT) + user dari database ke state
      startSession(res);

      return res;
    } catch (error) {
      console.error("Email login error:", error);
      alert(getApiErrorMessage(error, "Gagal melakukan login."));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Fungsi Login Berbasis MetaMask Wallet
  async function loginWithWallet() {
    if (typeof window.ethereum === "undefined") {
      alert("Silakan install ekstensi MetaMask di browser Anda!");
      return;
    }

    try {
      setIsLoading(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

      const payload = {
        walletAddress: walletAddress,
      };

      const res = await authService.loginWithWallet(payload);

      if (res.status === true) {
        startSession({ ...res, walletAddress });
      } else {
        alert(res.message);
      }

      return res;
    } catch (error) {
      console.error("Wallet login error:", error);
      alert(getApiErrorMessage(error, "Gagal menghubungkan wallet."));
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  // update profile ke backend (name, email, phone, city)
  async function updateProfile(partial) {
    if (!user) return;
    try {
      const res = await authService.UpdateProfile(user.userId, {
        name: partial.name ?? user.name,
        email: partial.email ?? user.email,
        phone: partial.phone ?? user.phone,
        city: partial.city ?? user.city,
      });
      if (!res.status) {
        alert(res.message);
        return res;
      }
      await getUserInfo();
      return res;
    } catch (error) {
      alert(getApiErrorMessage(error, "Gagal menyimpan profile."));
      throw error;
    }
  }

  /**
   * Register the current user as a seller.
   * `shopData` shape: { shopName, image, shopDescription, city, payoutWalletAddress }
   */
  async function registerSeller(shopData) {
    const res = await sellerservice.becomeSeller(user.userId, shopData);
    if (res.status) await getUserInfo();
    return res;
  }

  /**
   * Re-fetch shop info after the seller edits it.
   */
  async function updateShop() {
    return getUserInfo();
  }

  /**
   * Permanently delete the seller's shop, reverting the user back to a
   * regular buyer. Equivalent to "unregister seller".
   */
  async function deleteShop() {
    if (!user?.storeId) return;
    const res = await sellerservice.DeleteStore(user.storeId);
    if (!res.status) {
      alert(res.message);
      return res;
    }
    setUser((prev) => (prev ? { ...prev, storeId: "", storeName: "" } : prev));
    return res;
  }

  const isSeller = !!user?.storeId;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        isSeller,
        login,
        loginWithWallet,
        logout,
        updateProfile,
        registerSeller,
        updateShop,
        deleteShop,
        hydrated,
        getUserInfo,
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
