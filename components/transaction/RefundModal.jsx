"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Undo2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { uploadImage } from "@/lib/upload";
import { formatUSDT } from "@/lib/format";
import { toast } from "@/lib/toast";

/**
 * Form refund buyer: alasan, foto bukti, dan ID transaksi invoice on-chain.
 * onSubmit({ reason, photoUrl, invoiceTxHash }, setStep) dipanggil setelah foto ter-upload.
 */
export function RefundModal({ open, onClose, onSubmit, tx, userId }) {
  const [reason, setReason] = useState("");
  const [invoiceTxHash, setInvoiceTxHash] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");

  useEffect(() => {
    if (!open) return;
    setReason("");
    setInvoiceTxHash("");
    setFile(null);
    setPreview("");
    setStep("");
  }, [open]);

  useEffect(() => {
    if (!file) return setPreview("");
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const notDelivered = tx?.status !== "delivered";
  const attempt = (tx?.refundCount ?? 0) + 1;
  const validHash = /^0x[0-9a-fA-F]{64}$/.test(invoiceTxHash.trim());

  async function handleSubmit(e) {
    e.preventDefault();
    if (reason.trim().length < 10) return toast.warning("Please describe the reason (at least 10 characters).");
    if (!validHash) return toast.warning("Enter the invoice transaction ID (0x… 66 characters).");

    setBusy(true);
    try {
      let photoUrl = null;
      if (file) {
        setStep("Uploading photo…");
        photoUrl = await uploadImage(userId, "refunds", file);
      }
      await onSubmit({ reason: reason.trim(), photoUrl, invoiceTxHash: invoiceTxHash.trim() }, setStep);
    } catch (error) {
      toast.error(error.message || "Failed to request refund.");
    } finally {
      setBusy(false);
      setStep("");
    }
  }

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} labelledBy="refund-title">
      <form onSubmit={handleSubmit}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <Undo2 size={22} />
        </div>
        <h2 id="refund-title" className="mt-4 font-display text-xl font-semibold text-ink">
          Request a refund
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Attempt {attempt} of {tx?.maxRefundRequests ?? 3}. An admin reviews your request.{" "}
          {notDelivered
            ? "Because the package never arrived, no return is needed if it's approved."
            : "If approved, you must ship the item back within 3 days."}{" "}
          The confirmation timer is paused while the admin reviews.
        </p>
        <p className="mt-2 text-xs text-ink-faint">No MetaMask transaction needed, so requesting a refund costs no gas.</p>
        <p className="mt-2 rounded-lg bg-paper/70 px-3 py-2 text-xs text-ink-soft">
          Refund if approved: <span className="font-medium text-ink">{formatUSDT((tx?.itemsTotal ?? 0) + (tx?.shippingFee ?? 0))}</span>{" "}
          (items + shipping). The gas estimate stays with the seller.
        </p>

        <label className="mt-4 block text-sm font-medium text-ink">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="input-field mt-1.5"
          placeholder="Describe what's wrong with the order"
          required
        />

        <label className="mt-3 block text-sm font-medium text-ink">Photo evidence (optional)</label>
        {preview ? (
          <div className="relative mt-1.5 h-32 w-32 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Refund evidence" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="icon-btn absolute right-1 top-1 bg-surface/90"
              aria-label="Remove photo"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-ink-soft hover:bg-paper">
            <ImagePlus size={16} />
            Choose a photo (max 5 MB)
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        )}

        <label className="mt-3 block text-sm font-medium text-ink">Invoice transaction ID</label>
        <input
          value={invoiceTxHash}
          onChange={(e) => setInvoiceTxHash(e.target.value)}
          className="input-field mt-1.5 font-mono text-xs"
          placeholder="0x… (copy it from the on-chain invoice card)"
          required
        />
        <p className="mt-1 text-xs text-ink-faint">
          The ID is checked against the invoice recorded on Sepolia Etherscan before the request is sent.
        </p>

        {busy && step && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
            <Loader2 size={14} className="animate-spin" />
            {step}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} disabled={busy} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex-1">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Undo2 size={17} />}
            Submit request
          </button>
        </div>
      </form>
    </Modal>
  );
}
