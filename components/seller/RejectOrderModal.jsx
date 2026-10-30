"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, PackageX, Undo2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";

const QUICK_REASONS = [
  "Out of stock",
  "Item is damaged / defective",
  "Unable to ship to this address",
  "Price or listing error",
];

/**
 * Konfirmasi seller menolak order (refund onchain sebelum dikirim): seluruh dana di escrow kembali ke buyer.
 * Desain mengikuti ConfirmPaymentModal / AcceptOrderModal.
 * onConfirm(reason) dipanggil saat seller menekan tombol tolak.
 */
export function RejectOrderModal({ open, onClose, onConfirm, tx, processing, step }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  if (!tx) return null;
  const trimmed = reason.trim();
  const canSubmit = trimmed.length >= 5 && !processing;

  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="reject-order-title">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onConfirm(trimmed);
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <PackageX size={22} />
        </div>
        <h2 id="reject-order-title" className="mt-4 font-display text-xl font-semibold text-ink">
          Reject this order?
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Order <span className="font-semibold text-ink">{tx.code}</span> from{" "}
          <span className="font-semibold text-ink">{tx.buyerName || "the buyer"}</span> will be cancelled and the escrow
          refunds the buyer in full.
        </p>

        <dl className="mt-4 flex flex-col gap-1.5 rounded-xl bg-paper/70 px-4 py-3 text-xs">
          <div className="flex justify-between text-ink-soft">
            <dt>Items</dt>
            <dd>{formatUSDT(tx.itemsTotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>Shipping fee</dt>
            <dd>{formatUSDT(tx.shippingFee)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>Gas estimate</dt>
            <dd>{formatGasEstimate(tx.gasFee)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm font-medium text-ink">
            <dt className="flex items-center gap-1.5">
              <Undo2 size={14} className="text-ink-soft" />
              Refunded to buyer
            </dt>
            <dd>{formatUSDT(tx.total, { maxDecimals: 4 })}</dd>
          </div>
          {tx.buyerWallet && (
            <p className="text-right font-mono text-[11px] text-ink-faint">to {shortenAddress(tx.buyerWallet, 6)}</p>
          )}
        </dl>

        <label className="mt-4 block text-sm font-medium text-ink">Reason</label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {QUICK_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              disabled={processing}
              className={`chip border transition-colors ${
                reason === r ? "border-danger bg-danger-soft text-danger" : "border-border bg-surface text-ink-soft hover:bg-paper"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={processing}
          className="input-field mt-2"
          placeholder="Tell the buyer why the order is rejected"
          required
        />
        <p className="mt-1 text-xs text-ink-faint">The buyer sees this reason in the order activity.</p>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-xs text-danger">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>This can&apos;t be undone. You won&apos;t receive anything for this order, including the gas estimate.</span>
        </div>

        <p className="mt-3 text-xs text-ink-faint">
          1 MetaMask transaction (refund) · paid with a little Sepolia ETH · Mock USDT, no real money.
        </p>

        {processing && step && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
            <Loader2 size={14} className="animate-spin" />
            {step}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={processing} className="btn-secondary flex-1">
            Keep order
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Refunding...
              </>
            ) : (
              <>
                <PackageX size={17} />
                Reject &amp; refund
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
