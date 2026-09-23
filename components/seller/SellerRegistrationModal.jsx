"use client";

import { useEffect, useRef, useState } from "react";
import {
  Store,
  MapPin,
  AlignLeft,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { shortenAddress } from "@/lib/format";

/**
 * Payout wallet toggle — two pill halves that swap colour on selection.
 */
function PayoutToggle({ value, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-paper">
      <button
        type="button"
        onClick={() => onChange("own")}
        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          value === "own"
            ? "bg-ledger text-white"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <Wallet size={15} />
        My wallet
      </button>
      <button
        type="button"
        onClick={() => onChange("other")}
        className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
          value === "other"
            ? "bg-ledger text-white"
            : "text-ink-soft hover:text-ink"
        }`}
      >
        <ArrowRight size={15} />
        Other wallet
      </button>
    </div>
  );
}

/**
 * Image upload / preview field.
 * Reads the file as a data-URL so it can be stored in localStorage without
 * any backend. Warns when the file is large (> 400 KB) since localStorage
 * space is limited — swap this for a proper upload endpoint later.
 */
function ShopImageUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [warn, setWarn] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setWarn(file.size > 400 * 1024);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
    // reset input so re-selecting the same file still fires onChange
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setWarn(file.size > 400 * 1024);
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  function handleClear(e) {
    e.stopPropagation();
    onChange(null);
    setWarn(false);
  }

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
        <ImagePlus size={12} />
        Shop photo
        <span className="ml-auto text-ink-faint">optional</span>
      </label>

      {/* drop zone / preview */}
      <div
        onClick={() => !value && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`relative flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          value
            ? "border-border"
            : "cursor-pointer border-dashed border-border hover:border-ledger hover:bg-ledger-soft/30"
        }`}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Shop preview"
              className="h-full max-h-48 w-full object-cover"
            />
            {/* overlay buttons */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/30 opacity-0 transition-opacity duration-200 hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow transition-all hover:bg-paper active:scale-95"
              >
                <ImagePlus size={13} />
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1.5 rounded-full bg-danger px-3 py-1.5 text-xs font-medium text-white shadow transition-all hover:bg-danger-dark active:scale-95"
              >
                <X size={13} />
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper">
              <ImagePlus size={20} className="text-ink-faint" />
            </div>
            <p className="text-xs font-medium text-ink-soft">
              Click or drag & drop an image
            </p>
            <p className="text-[11px] text-ink-faint">
              JPG, PNG or WebP · best at 1:1 ratio
            </p>
          </div>
        )}
      </div>

      {warn && (
        <p className="mt-1 text-[11px] text-seal-dark">
          Large image — consider compressing it first so it fits in local
          storage. Swap for a proper upload endpoint in production.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

const CITIES = [
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Barat",
  "Jakarta Utara",
  "Jakarta Timur",
  "Bandung",
  "Surabaya",
  "Yogyakarta",
  "Semarang",
  "Medan",
  "Makassar",
  "Denpasar",
  "Palembang",
  "Bogor",
  "Depok",
  "Tangerang",
  "Bekasi",
  "Malang",
  "Cikarang",
];

const EMPTY_FORM = (walletAddress = "") => ({
  shopName: "",
  shopImage: null,
  shopDescription: "",
  city: "",
  payoutMode: "own",
  payoutWallet: walletAddress,
});

export function SellerRegistrationModal({ open, onClose }) {
  const { user, registerSeller } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM(user?.walletAddress));
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Keep payoutWallet in sync when mode switches to "own"
  useEffect(() => {
    if (form.payoutMode === "own") {
      setForm((f) => ({ ...f, payoutWallet: user?.walletAddress ?? "" }));
    }
  }, [form.payoutMode, user?.walletAddress]);

  function set(field) {
    return (val) =>
      setForm((f) => ({ ...f, [field]: typeof val === "object" && val?.target ? val.target.value : val }));
  }

  function handlePayoutModeChange(mode) {
    setForm((f) => ({
      ...f,
      payoutMode: mode,
      payoutWallet: mode === "own" ? (user?.walletAddress ?? "") : "",
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.shopName.trim()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      registerSeller({
        shopName: form.shopName.trim(),
        shopImage: form.shopImage,
        shopDescription: form.shopDescription.trim(),
        city: form.city,
        payoutWallet: form.payoutWallet,
      });
      setSubmitting(false);
      setDone(true);
    }, 900);
  }

  function handleClose() {
    if (submitting) return;
    if (done) {
      setDone(false);
      setForm(EMPTY_FORM(user?.walletAddress));
    }
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} labelledBy="seller-reg-title">
      {done ? (
        /* ── Success ── */
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ledger-soft text-ledger-dark">
            <CheckCircle2 size={26} />
          </div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Welcome to the seller program!
          </h2>
          <p className="max-w-xs text-sm text-ink-soft">
            Your shop{" "}
            <span className="font-semibold text-ink">{form.shopName}</span> is
            now live. Start listing products whenever you're ready.
          </p>
          <button type="button" onClick={handleClose} className="btn-primary mt-2">
            <Store size={16} />
            Go to my shop dashboard
          </button>
        </div>
      ) : (
        /* ── Form ── */
        <>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seal-soft text-seal-dark">
              <Store size={18} />
            </div>
            <div>
              <h2 id="seller-reg-title" className="font-display text-xl font-semibold text-ink">
                Open your shop
              </h2>
              <p className="text-xs text-ink-faint">Takes less than a minute to set up.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            {/* Shop name */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Store size={12} />
                Shop name
              </label>
              <input
                value={form.shopName}
                onChange={set("shopName")}
                placeholder="e.g. Nimbus Official Store"
                className="input-field"
                required
                maxLength={60}
              />
            </div>

            {/* Shop image */}
            <ShopImageUpload
              value={form.shopImage}
              onChange={(v) => setForm((f) => ({ ...f, shopImage: v }))}
            />

            {/* Description */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <AlignLeft size={12} />
                Shop description
                <span className="ml-auto text-ink-faint">optional</span>
              </label>
              <textarea
                value={form.shopDescription}
                onChange={set("shopDescription")}
                placeholder="Tell buyers what makes your shop special..."
                rows={2}
                maxLength={200}
                className="input-field resize-none"
              />
            </div>

            {/* City */}
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <MapPin size={12} />
                City / location
              </label>
              <select
                value={form.city}
                onChange={set("city")}
                className="input-field bg-surface"
                required
              >
                <option value="" disabled>Select a city…</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Payout wallet */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Wallet size={12} />
                Payout wallet
              </label>
              <PayoutToggle value={form.payoutMode} onChange={handlePayoutModeChange} />
              <div className="mt-2">
                <input
                  value={form.payoutWallet}
                  onChange={set("payoutWallet")}
                  disabled={form.payoutMode === "own"}
                  placeholder="0x..."
                  className={`input-field font-mono text-xs ${
                    form.payoutMode === "own"
                      ? "cursor-not-allowed bg-paper text-ink-faint"
                      : ""
                  }`}
                  required
                />
                {form.payoutMode === "own" && user?.walletAddress && (
                  <p className="mt-1 text-xs text-ink-faint">
                    Using{" "}
                    <span className="font-mono text-signal-dark">
                      {shortenAddress(user.walletAddress, 8)}
                    </span>{" "}
                    — your connected wallet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-1 flex gap-3">
              <button type="button" onClick={handleClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Registering…
                  </>
                ) : (
                  <>
                    <Store size={16} />
                    Open my shop
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
