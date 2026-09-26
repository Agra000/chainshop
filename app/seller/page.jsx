"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Store,
  MapPin,
  Wallet,
  PackagePlus,
  BarChart3,
  ShieldCheck,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BackButton } from "@/components/ui/BackButton";
import { shortenAddress, formatDate } from "@/lib/format";

/** Inline confirm modal — no extra component file needed. */
function DeleteStoreModal({ shopName, open, onClose, onConfirm, deleting }) {
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

export default function SellerDashboardPage() {
  const { user, isSeller, deleteShop, hydrated } = useAuth();
  const router = useRouter();

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Redirect buyers who land here directly.
  useEffect(() => {
    if (hydrated && !isSeller) router.replace("/");
  }, [hydrated, isSeller, router]);

  if (!hydrated || !isSeller) return null;

  const shop = user.shop;

  const stats = [
    { label: "Products listed", value: "0", icon: PackagePlus },
    { label: "Orders received", value: "0", icon: BarChart3 },
    { label: "Completed sales", value: "0", icon: ShieldCheck },
  ];

  function handleDeleteConfirm() {
    setDeleting(true);
    // Simulated async delete — swap for contract call later.
    window.setTimeout(() => {
      deleteShop();
      setDeleting(false);
      setDeleteModal(false);
      router.replace("/");
    }, 900);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">
        Seller Dashboard
      </h1>

      <div className="grid gap-5 md:grid-cols-[280px_1fr] md:items-start">
        {/* ── Shop identity card ── */}
        <div className="flex flex-col gap-3">
          <section className="card overflow-hidden">
            {/* shop banner / image */}
            {shop.shopImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shop.shopImage}
                alt={shop.shopName}
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="flex h-24 w-full items-center justify-center bg-seal-soft">
                <Store size={32} className="text-seal-dark opacity-60" />
              </div>
            )}

            <div className="flex flex-col items-center gap-2.5 p-5 text-center">
              <p className="font-display text-base font-semibold text-ink">
                {shop.shopName}
              </p>

              {shop.shopDescription && (
                <p className="text-xs leading-relaxed text-ink-soft">
                  {shop.shopDescription}
                </p>
              )}

              <div className="flex w-full flex-col gap-2 border-t border-border pt-3 text-left text-xs text-ink-soft">
                {shop.city && (
                  <span className="flex items-center gap-2">
                    <MapPin size={13} className="shrink-0 text-ink-faint" />
                    {shop.city}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Wallet size={13} className="shrink-0 text-ink-faint" />
                  <span className="truncate font-mono text-signal-dark">
                    {shortenAddress(shop.payoutWallet, 8)}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <ShieldCheck size={13} className="shrink-0 text-ledger" />
                  Seller since {formatDate(shop.registeredAt)}
                </span>
              </div>

              <Link
                href="/seller/settings"
                className="btn-secondary w-full !py-2 !text-xs"
              >
                <Edit3 size={13} />
                Edit shop info
              </Link>
            </div>
          </section>

          {/* ── Danger zone ── */}
          <section className="card border-danger/20 p-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-danger">
              Danger zone
            </p>
            <p className="mb-3 text-xs text-ink-soft">
              Deleting your store is permanent. Your buyer account stays intact.
            </p>
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft py-2 text-sm font-medium text-danger transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white active:scale-[0.97]"
            >
              <Trash2 size={15} />
              Delete store
            </button>
          </section>
        </div>

        {/* ── Stats + quick actions ── */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="card px-4 py-3.5">
                <Icon size={16} className="mb-2 text-ink-faint" />
                <p className="font-display text-xl font-semibold text-ink">
                  {value}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">{label}</p>
              </div>
            ))}
          </div>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">
              Get started
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Your shop is open. Product listing, order management, and payout
              tracking will appear here once the seller backend is wired up to
              the smart contract.
            </p>

            <div className="mt-4 flex flex-col gap-2.5">
              <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4">
                <PackagePlus size={18} className="mt-0.5 shrink-0 text-seal" />
                <div>
                  <p className="text-sm font-medium text-ink">
                    Add your first product
                  </p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    Product listing UI is coming in the next sprint — connect
                    your backend to unlock this.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-ledger" />
                <div>
                  <p className="text-sm font-medium text-ink">Escrow payouts</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    When a buyer confirms delivery, the smart contract
                    automatically releases funds to{" "}
                    <span className="font-mono text-signal-dark">
                      {shortenAddress(shop.payoutWallet, 6)}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <DeleteStoreModal
        shopName={shop.shopName}
        open={deleteModal}
        onClose={() => !deleting && setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </div>
  );
}
