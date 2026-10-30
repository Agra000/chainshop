"use client";

import { AlertTriangle, Loader2, PackageCheck, PenLine } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";

/**
 * Konfirmasi buyer menerima barang. v3: cukup TANDA TANGAN EIP-712 di MetaMask (gratis, tanpa gas);
 * seller yang nanti mengklaim dana onchain dengan tanda tangan ini.
 * Desain mengikuti ConfirmPaymentModal: ikon, judul, rincian dana, langkah MetaMask, tombol aksi.
 */
export function AcceptOrderModal({ open, onClose, onConfirm, tx, processing, step }) {
  if (!tx) return null;

  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="accept-order-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
        <PackageCheck size={22} />
      </div>
      <h2 id="accept-order-title" className="mt-4 font-display text-xl font-semibold text-ink">
        Accept this order?
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Confirm you&apos;ve received <span className="font-semibold text-ink">{tx.items.length} item line{tx.items.length > 1 ? "s" : ""}</span>{" "}
        from <span className="font-semibold text-ink">{tx.shopName}</span> in good condition. You only sign a message,
        then the seller claims the payment from escrow.
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
          <dt>Seller can claim</dt>
          <dd>{formatUSDT(tx.total, { maxDecimals: 4 })}</dd>
        </div>
        {tx.sellerWallet && (
          <p className="text-right font-mono text-[11px] text-ink-faint">to {shortenAddress(tx.sellerWallet, 6)}</p>
        )}
      </dl>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-signal/30 bg-signal-soft px-3.5 py-2.5 text-xs text-signal-dark">
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          This can&apos;t be undone. After accepting, you can no longer request a refund for this order. If something is
          wrong, close this and choose <strong>Request refund</strong> instead.
        </span>
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        1 MetaMask signature · free, no gas or Sepolia ETH needed · Mock USDT, no real money.
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
              Accepting...
            </>
          ) : (
            <>
              <PenLine size={17} />
              Sign & accept
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
