"use client";

import { BadgeCheck, Fuel, Loader2, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatDate, formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";

/**
 * v3: seller mengklaim dana dari escrow memakai tanda tangan persetujuan buyer (releaseWithAcceptance).
 * Gas transaksi dibayar seller; estimasi gas yang dibayar buyer saat checkout ikut cair ke seller.
 * Desain mengikuti ConfirmPaymentModal / AcceptOrderModal / ConfirmReturnModal.
 */
export function ClaimPaymentModal({ open, onClose, onConfirm, tx, processing, step }) {
  if (!tx) return null;

  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="claim-payment-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
        <Wallet size={22} />
      </div>
      <h2 id="claim-payment-title" className="mt-4 font-display text-xl font-semibold text-ink">
        Claim payment?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        <span className="font-semibold text-ink">{tx.buyerName || "The buyer"}</span> accepted{" "}
        <span className="font-semibold text-ink">{tx.code}</span>
        {tx.acceptedAt ? ` on ${formatDate(tx.acceptedAt)}` : ""}. Send their signed acceptance to the escrow to
        receive the payment.
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
          <dt className="flex items-center gap-1.5">
            <Fuel size={13} />
            Gas estimate (covers this claim)
          </dt>
          <dd>{formatGasEstimate(tx.gasFee)}</dd>
        </div>
        <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm font-medium text-ink">
          <dt>You receive</dt>
          <dd>{formatUSDT(tx.total, { maxDecimals: 4 })}</dd>
        </div>
        {tx.sellerWallet && (
          <p className="text-right font-mono text-[11px] text-ink-faint">to {shortenAddress(tx.sellerWallet, 6)}</p>
        )}
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-ledger/30 bg-ledger-soft px-3.5 py-2.5 text-xs text-ledger-dark">
        <BadgeCheck size={14} className="mt-0.5 shrink-0" />
        <span>
          The smart contract checks the buyer&apos;s signature, so the payment can only be claimed for this order and only
          once.
        </span>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        1 MetaMask transaction (claim) · paid by you with a little Sepolia ETH · Mock USDT, no real money.
      </p>

      {processing && step && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
          <Loader2 size={14} className="animate-spin" />
          {step}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={processing} className="btn-secondary flex-1">
          Later
        </button>
        <button type="button" onClick={onConfirm} disabled={processing} className="btn-primary flex-1">
          {processing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <Wallet size={17} />
              Claim payment
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
