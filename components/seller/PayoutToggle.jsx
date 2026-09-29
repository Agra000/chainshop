import { Wallet, ArrowRight } from "lucide-react";

export function PayoutToggle({ value, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-paper">
      <button
        type="button"
        onClick={() => onChange("own")}
        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          value === "own"
            ? "bg-ledger text-white"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <Wallet size={15} />
        My wallet
      </button>
      <button
        type="button"
        onClick={() => onChange("other")}
        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          value === "other"
            ? "bg-ledger text-white"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <ArrowRight size={15} />
        Other wallet
      </button>
    </div>
  );
}
