"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Fuel, Loader2, PackageOpen, Undo2, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";

/**
 * Konfirmasi keputusan admin (arbiter) atas pengajuan refund: approve atau reject.
 * mode = "approve" | "reject". Desain mengikuti ConfirmPaymentModal / RejectOrderModal / ConfirmReturnModal.
 *  - reject: off-chain, order lanjut dan timer buyer berjalan lagi
 *  - approve (barang sudah sampai): off-chain, buyer diminta mengirim retur
 *  - approve (barang tak sampai): 1 transaksi MetaMask `refund` dari wallet ADMIN_ROLE
 */
export function RefundDecisionModal({ open, mode, onClose, onConfirm, order, refund, processing, step }) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open, mode]);

  if (!order || !refund || !mode) return null;

  const approve = mode === "approve";
  const onchain = approve && refund.notDelivered;
  const refundToBuyer = (order.itemsTotal ?? 0) + (order.shippingFee ?? 0);
  const used = order.refundCount ?? 0;
  const max = order.maxRefundRequests ?? 3;

  const Icon = approve ? CheckCircle2 : XCircle;
  const title = approve ? "Approve this refund?" : "Reject this refund?";
  const intro = approve
    ? onchain
      ? "The package never arrived. Approving pays the refund to the buyer right away."
      : "The buyer will be asked to ship the item back. The refund is paid after the seller confirms the return."
    : "The order continues and the buyer's confirmation timer resumes from where it was paused.";

  return (
    <Modal open={open} onClose={processing ? undefined : onClose} labelledBy="refund-decision-title">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          approve ? "bg-ledger-soft text-ledger-dark" : "bg-danger-soft text-danger"
        }`}
      >
        <Icon size={22} />
      </div>
      <h2 id="refund-decision-title" className="mt-4 font-display text-xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Refund #{refund.attempt} for <span className="font-semibold text-ink">{order.code}</span> · {order.buyerName} →{" "}
        {order.shopName}. {intro}
      </p>

      {approve ? (
        <dl className="mt-4 flex flex-col gap-1.5 rounded-xl bg-paper/70 px-4 py-3 text-xs">
          <div className="flex justify-between text-ink-soft">
            <dt>Items</dt>
            <dd>{formatUSDT(order.itemsTotal)}</dd>
          </div>
          <div className="flex justify-between text-ink-soft">
            <dt>Shipping fee</dt>
            <dd>{formatUSDT(order.shippingFee)}</dd>
          </div>
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-sm font-medium text-ink">
            <dt className="flex items-center gap-1.5">
              <Undo2 size={14} className="text-ink-soft" />
              {onchain ? "Refunded to buyer now" : "Refunded to buyer after return"}
            </dt>
            <dd>{formatUSDT(refundToBuyer)}</dd>
          </div>
          {order.buyerWallet && (
            <p className="text-right font-mono text-[11px] text-ink-faint">to {shortenAddress(order.buyerWallet, 6)}</p>
          )}
          <div className="mt-1 flex justify-between border-t border-border pt-2 text-ink-soft">
            <dt className="flex items-center gap-1.5">
              <Fuel size={13} />
              Gas estimate (stays with seller)
            </dt>
            <dd>{formatGasEstimate(order.gasFee)}</dd>
          </div>
        </dl>
      ) : (
        <div className="mt-4 flex flex-col gap-1.5 rounded-xl bg-paper/70 px-4 py-3 text-xs text-ink-soft">
          <p className="flex items-center gap-1.5">
            <PackageOpen size={14} />
            Money stays in escrow, nothing is sent on-chain.
          </p>
          <p>
            Refund requests used: <span className="font-medium text-ink">{used}/{max}</span>
            {used < max ? " · the buyer can request again." : " · this was the buyer's last request."}
          </p>
        </div>
      )}

      <label className="mt-4 block text-xs font-medium text-ink" htmlFor="refund-decision-note">
        Note for buyer &amp; seller {approve ? "(optional)" : "(recommended)"}
      </label>
      <textarea
        id="refund-decision-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        maxLength={500}
        disabled={processing}
        className="input-field mt-1.5"
        placeholder={approve ? "e.g. Photo shows the item is damaged" : "e.g. The photo does not show any defect"}
      />

      <div
        className={`mt-3 flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs ${
          onchain ? "border-signal/30 bg-signal-soft text-signal-dark" : "border-border bg-paper/70 text-ink-soft"
        }`}
      >
        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
        <span>
          {onchain
            ? "This can't be undone. Use the MetaMask wallet that has ADMIN_ROLE in the escrow contract (1 transaction, paid with a little Sepolia ETH)."
            : "Recorded off-chain, no MetaMask transaction needed. The decision is shown to the buyer and seller."}
        </span>
      </div>

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
        <button
          type="button"
          onClick={() => onConfirm(note.trim())}
          disabled={processing}
          className={
            approve
              ? "btn-primary flex-1"
              : "flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          }
        >
          {processing ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {approve ? "Approving..." : "Rejecting..."}
            </>
          ) : (
            <>
              <Icon size={17} />
              {approve ? (onchain ? "Approve & refund" : "Approve refund") : "Reject refund"}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
