"use client";

import { Landmark, WalletMinimal, CreditCard, Coins } from "lucide-react";

export const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer / Virtual Account", icon: Landmark },
  { id: "ewallet", label: "E-Wallet Balance", icon: WalletMinimal },
  { id: "card", label: "Credit / Debit Card", icon: CreditCard },
  { id: "crypto", label: "Crypto Wallet (USDT / ETH)", icon: Coins },
];

export function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-all duration-150 ease-out ${
              active
                ? "border-ledger bg-ledger-soft text-ledger-dark"
                : "border-border text-ink hover:border-ink/20 hover:bg-paper"
            }`}
          >
            <Icon size={18} className={active ? "text-ledger-dark" : "text-ink-soft"} />
            <span className="flex-1 font-medium">{label}</span>
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
                active ? "border-ledger" : "border-border"
              }`}
            >
              {active && <span className="h-2.5 w-2.5 rounded-full bg-ledger" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
