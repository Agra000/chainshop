import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

export default function DeleteStoreModal({ shopName, open, onClose, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-store-title"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={deleting ? undefined : onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <div className="relative w-full max-w-sm animate-pop-in rounded-2xl bg-surface p-6 shadow-xl">
        {!deleting && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="icon-btn absolute right-3 top-3"
          >
            <X size={17} />
          </button>
        )}

        {/* icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
          <AlertTriangle size={22} />
        </div>

        <h2
          id="delete-store-title"
          className="mt-4 font-display text-lg font-semibold text-ink"
        >
          Delete store?
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft">
          <span className="font-semibold text-ink">{shopName}</span> will be
          permanently removed. You can re-register a new shop anytime, but all
          shop data and settings will be lost.
        </p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-secondary flex-1"
          >
            Keep store
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
                Yes, delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
