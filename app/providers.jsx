"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { TransactionProvider } from "@/context/TransactionContext";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TransactionProvider>{children}</TransactionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
