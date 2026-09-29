"use client";

import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  AlignLeft,
  Wallet,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { shortenAddress } from "@/lib/format";
import { sellerservice } from "@/services/SellerService";
import { ShopImageUpload } from "./ShopImageUpload";
import { PayoutToggle } from "./PayoutToggle";

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
  const { user } = useAuth();

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
      setForm((f) => ({
        ...f,
        [field]:
          typeof val === "object" && val?.target ? val.target.value : val,
      }));
  }

  function handlePayoutModeChange(mode) {
    setForm((f) => ({
      ...f,
      payoutMode: mode,
      payoutWallet: mode === "own" ? (user?.walletAddress ?? "") : "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.shopName.trim()) return;

    setSubmitting(true);
    // setErrorMessage("");

    try {
      // Siapkan payload data
      const dataPayload = {
        shopName: form.shopName.trim(),
        image: form.shopImage ?? "",
        shopDescription: form.shopDescription.trim(),
        city: form.city,
        PayoutWalletAddress: form.payoutWallet,
      };
      console.log(dataPayload);
      // Panggil API service. Pastikan user.id tersedia (sesuaikan dengan nama properti id user Anda)
      const res = await sellerservice.becomeSeller(user.userId, dataPayload);

      setDone(true);

      // Optional: Anda bisa langsung menutup modal jika berhasil
      // onClose();
    } catch (error) {
      console.error("Error registering seller:", error);
    } finally {
      // Matikan status loading terlepas dari berhasil atau gagal
      setSubmitting(false);
    }
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
          <button
            type="button"
            onClick={handleClose}
            className="btn-primary mt-2"
          >
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
              <h2
                id="seller-reg-title"
                className="font-display text-xl font-semibold text-ink"
              >
                Open your shop
              </h2>
              <p className="text-xs text-ink-faint">
                Takes less than a minute to set up.
              </p>
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
                <option value="" disabled>
                  Select a city…
                </option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Payout wallet */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <Wallet size={12} />
                Payout wallet
              </label>
              <PayoutToggle
                value={form.payoutMode}
                onChange={handlePayoutModeChange}
              />
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
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1"
              >
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
