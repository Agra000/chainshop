"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatIDR } from "@/lib/format";

export function ConfirmPaymentModal({
  open,
  onClose,
  onConfirm,
  total,
  paymentMethodLabel,
  processing,
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
        You're about to pay <span className="font-semibold text-ink">{formatIDR(total)}</span> via{" "}
        {paymentMethodLabel}. The amount will be locked in escrow and only released to the
        seller once you confirm the order arrived.
      </p>

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
