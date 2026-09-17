import { ShieldCheck } from "lucide-react";

export function EscrowBadge({ className = "", text = "Escrow protected" }) {
  return (
    <span
      className={`chip border border-ledger/20 bg-ledger-soft text-ledger-dark ${className}`}
    >
      <ShieldCheck size={13} strokeWidth={2.4} />
      {text}
    </span>
  );
}
