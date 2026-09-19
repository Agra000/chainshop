"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/AuthService";

const AuthContext = createContext(null);
const STORAGE_KEY = "chainshop_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // 1. Fungsi Login Berbasis Email / Auth Biasa
  async function login({ email, password, name }) {
    try {
      setIsLoading(true);

      const payload = {
        email: email?.trim(),
        password: password, // jika backend menggunakan password
        name: name?.trim() || "ChainShop User",
      };

      // Tembak ke API login backend
      const res = await authService.login(payload);

      // Simpan user dari database ke state
      setUser({
        ...res.user,
        avatarSeed: res.user.email || `${Date.now()}`,
        joinedAt: res.user.createdAt || new Date().toISOString(),
      });

      return res;
    } catch (error) {
      console.error("Email login error:", error);
      alert(error?.response?.data?.message || "Gagal melakukan login.");
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
        console.log("res:", res);
        setUser({
          name: res.idToken || "ChainShop User",
          email: res.idToken + "@gmail.com",
          walletAddress: res.walletAddress,
        });
      }

      // return res;
      return;
    } catch (error) {
      console.error("Wallet login error:", error);
      alert(error?.response?.data?.message || "Gagal menghubungkan wallet.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  function updateProfile(partial) {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        loginWithWallet,
        logout,
        updateProfile,
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
