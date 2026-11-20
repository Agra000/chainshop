"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

// Konfirmasi hapus produk dari halaman detail produk seller.
export function DeleteProductModal({ productName, open, onClose, onConfirm, deleting }) {
  return (
    <Modal open={open} onClose={deleting ? undefined : onClose} labelledBy="delete-product-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle size={22} />
      </div>
      <h2 id="delete-product-title" className="mt-4 font-display text-lg font-semibold text-ink">
        Delete product?
      </h2>
      <p className="mt-1.5 text-sm text-ink-soft">
        <span className="font-semibold text-ink">{productName}</span> will be removed from your shop and its photo deleted
        from storage. Past orders and reviews stay in buyers&apos; history.
      </p>

      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onClose} disabled={deleting} className="btn-secondary flex-1">
          Keep product
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={deleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-out hover:bg-danger-dark hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-ink-faint"
        >
          {deleting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Deleting…
            </>
          ) : (
            <>
              <Trash2 size={16} />
              Delete
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
