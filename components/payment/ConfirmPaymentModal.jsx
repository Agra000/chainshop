"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatUSDT } from "@/lib/format";

export function ConfirmPaymentModal({
  open,
  onClose,
  onConfirm,
  total,
  orderCount = 1,
  paymentMethodLabel,
  processing,
  step,
}) {
  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="confirm-payment-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
        <ShieldCheck size={22} />
      </div>
      <h2 id="confirm-payment-title" className="mt-4 font-display text-xl font-semibold text-ink">
        Confirm payment
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        You&apos;re about to lock <span className="font-semibold text-ink">{formatUSDT(total, { maxDecimals: 4 })}</span> via{" "}
        {paymentMethodLabel} in the escrow smart contract. It is only released to the seller once you confirm the
        order arrived (or automatically 3 days after it arrives).
      </p>

      <ol className="mt-4 flex list-decimal flex-col gap-1 rounded-xl bg-paper/70 py-3 pl-8 pr-4 text-xs text-ink-soft">
        <li>Approve mUSDT for the escrow contract (only if needed)</li>
        <li>
          Deposit to escrow — {orderCount} transaction{orderCount > 1 ? "s" : ""} (1 per seller)
        </li>
      </ol>
      <p className="mt-2 text-xs text-ink-faint">Sepolia testnet · Mock USDT · no real money involved.</p>

      {processing && step && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
          <Loader2 size={14} className="animate-spin" />
          {step}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={processing} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={processing} className="btn-primary flex-1">
          {processing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck size={17} />
              Confirm & Pay
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
