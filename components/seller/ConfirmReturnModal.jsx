"use client";

import { AlertTriangle, Fuel, Loader2, PackageCheck, Undo2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";

/**
 * Konfirmasi seller sudah menerima barang retur (refund onchain oleh seller).
 * Barang + ongkir kembali ke buyer, estimasi gas tetap untuk seller.
 * Desain mengikuti ConfirmPaymentModal / AcceptOrderModal / RejectOrderModal.
 */
export function ConfirmReturnModal({ open, onClose, onConfirm, tx, processing, step }) {
  if (!tx) return null;
  const refundToBuyer = (tx.itemsTotal ?? 0) + (tx.shippingFee ?? 0);

  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="confirm-return-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
        <PackageCheck size={22} />
      </div>
      <h2 id="confirm-return-title" className="mt-4 font-display text-xl font-semibold text-ink">
        Returned item received?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Confirm the return for <span className="font-semibold text-ink">{tx.code}</span>
        {tx.returnTrackingNumber && (
          <>
            {" "}
            (tracking <span className="font-mono text-ink">{tx.returnTrackingNumber}</span>)
          </>
        )}{" "}
        has arrived. The escrow then pays the refund to the buyer.
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
        <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm font-medium text-ink">
          <dt className="flex items-center gap-1.5">
            <Undo2 size={14} className="text-ink-soft" />
            Refunded to buyer
          </dt>
          <dd>{formatUSDT(refundToBuyer)}</dd>
        </div>
        {tx.buyerWallet && (
          <p className="text-right font-mono text-[11px] text-ink-faint">to {shortenAddress(tx.buyerWallet, 6)}</p>
        )}
        <div className="mt-1 flex justify-between border-t border-border pt-2 font-medium text-ledger-dark">
          <dt className="flex items-center gap-1.5">
            <Fuel size={13} />
            Gas estimate paid to you
          </dt>
          <dd>{formatGasEstimate(tx.gasFee)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-signal/30 bg-signal-soft px-3.5 py-2.5 text-xs text-signal-dark">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          Check the returned item first. This can&apos;t be undone. If you don&apos;t confirm before the deadline, the refund is
          sent to the buyer automatically.
        </span>
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
          Not yet
        </button>
        <button type="button" onClick={onConfirm} disabled={processing} className="btn-primary flex-1">
          {processing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Refunding...
            </>
          ) : (
            <>
              <PackageCheck size={17} />
              Confirm & refund
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
