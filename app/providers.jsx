"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { ProductProvider } from "@/context/ProductContext";
import { SellerNotificationProvider } from "@/context/SellerNotificationContext";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TransactionProvider>
          <ProductProvider>
            <SellerNotificationProvider>
              {children}
              <Toaster />
            </SellerNotificationProvider>
          </ProductProvider>
        </TransactionProvider>
      </CartProvider>
    </AuthProvider>
  );
}
