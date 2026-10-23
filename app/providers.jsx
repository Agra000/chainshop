"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { ProductProvider } from "@/context/ProductContext";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TransactionProvider>
          <ProductProvider>
            {children}
            <Toaster />
          </ProductProvider>
        </TransactionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
