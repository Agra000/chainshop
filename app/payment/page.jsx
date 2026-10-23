"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Fuel, Info, MapPin, PackageOpen, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTransactions } from "@/context/TransactionContext";
import { addressService } from "@/services/AddressService";
import { getApiErrorMessage } from "@/lib/axios";
import { formatUSDT, estimateGasFee } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { PaymentMethodSelector, PAYMENT_METHODS } from "@/components/payment/PaymentMethodSelector";
import { ConfirmPaymentModal } from "@/components/payment/ConfirmPaymentModal";
import { toast } from "@/lib/toast";
import { PaymentSkeleton } from "@/components/ui/Skeleton";

export default function PaymentPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { selectedItems, checkoutSelected, hydrated } = useCart();
  const { createTransaction } = useTransactions();

  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // alamat pengiriman (MsAddresses)
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState("");
  const [addressForm, setAddressForm] = useState({
    recipientName: "",
    phone: "",
    fullAddress: "",
    city: "",
    province: "",
    postalCode: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  async function loadAddresses() {
    if (!user?.userId) return;
    const res = await addressService.GetAddresses(user.userId);
    const data = res.data || [];
    setAddresses(data);
    setAddressId((prev) => prev || data.find((a) => a.isDefault)?.id || data[0]?.id || "");
  }

  useEffect(() => {
    loadAddresses().catch(() => {});
  }, [user?.userId]);

  async function handleSaveAddress(e) {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await addressService.UpsertAddress(user.userId, { ...addressForm, isDefault: true });
      if (!res.status) {
        toast.error(res.message);
        return;
      }
      setAddressId("");
      await loadAddresses();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save address."));
    } finally {
      setSavingAddress(false);
    }
  }

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems]
  );
  const allDigital = selectedItems.length > 0 && selectedItems.every((it) => it.category === "topup");
  const shippingFee = allDigital || subtotal === 0 ? 0 : 1;
  const gasFee = useMemo(() => estimateGasFee(subtotal || 0), [subtotal]);
  const total = subtotal + shippingFee + gasFee;

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "";

  async function handleConfirm() {
    if (!addressId) {
      toast.warning("Tambahkan alamat pengiriman terlebih dahulu.");
      setModalOpen(false);
      return;
    }

    setProcessing(true);
    try {
      // checkout -> escrow hold (onchain) -> verifikasi pembayaran di backend
      const tx = await createTransaction({
        items: selectedItems,
        addressId,
        shippingFee,
        gasFee,
        paymentMethod: method,
        paymentMethodLabel: methodLabel,
        totalPrice: total,
      });
      await checkoutSelected();
      setModalOpen(false);
      router.push(tx.orders.length > 1 ? "/transaction" : `/transaction/${tx.id}`);
    } catch (error) {
      await checkoutSelected();
      toast.error(getApiErrorMessage(error, "Payment failed."));
      setModalOpen(false);
    } finally {
      setProcessing(false);
    }
  }

  if (!hydrated) return <PaymentSkeleton />;

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/cart" />
        <div className="mt-3">
          <EmptyState
            icon={<Wallet size={26} />}
            title="You're not logged in"
            description="Log in from the navbar to continue to payment."
            actionLabel="Back to cart"
            actionHref="/cart"
          />
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/cart" />
        <div className="mt-3">
          <EmptyState
            icon={<PackageOpen size={26} />}
            title="No items selected"
            description="Go back to your cart and select the items you'd like to check out."
            actionLabel="Back to cart"
            actionHref="/cart"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/cart" />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Payment</h1>

      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-start">
        {/* left card: items being purchased */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">
            Items ({selectedItems.length})
          </h2>
          <div className="mt-3 flex flex-col divide-y divide-border">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm text-ink">{item.name}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">Qty {item.qty}</p>
                </div>
                <p className="whitespace-nowrap text-sm font-semibold text-ink">
                  {formatUSDT(item.qty * item.price)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <MapPin size={15} className="text-ink-soft" />
              Shipping address
            </p>
            {addresses.length > 0 ? (
              <select
                value={addressId}
                onChange={(e) => setAddressId(e.target.value)}
                className="input-field bg-surface"
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.recipientName}, {a.fullAddress}, {a.city}
                  </option>
                ))}
              </select>
            ) : (
              <form onSubmit={handleSaveAddress} className="grid gap-2 sm:grid-cols-2">
                {[
                  ["recipientName", "Recipient name"],
                  ["phone", "Phone number"],
                  ["fullAddress", "Full address"],
                  ["city", "City"],
                  ["province", "Province"],
                  ["postalCode", "Postal code"],
                ].map(([field, label]) => (
                  <input
                    key={field}
                    value={addressForm[field]}
                    onChange={(e) => setAddressForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={label}
                    className="input-field"
                    required={field !== "postalCode"}
                  />
                ))}
                <button type="submit" disabled={savingAddress} className="btn-secondary sm:col-span-2">
                  {savingAddress ? "Saving…" : "Save address"}
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper/70 px-4 py-3 text-xs text-ink-soft">
            <Truck size={15} className="shrink-0 text-ink-soft" />
            {allDigital
              ? "Digital delivery — no shipping needed."
              : "Estimated delivery: 2–4 business days."}
          </div>
        </section>

        {/* right card: totals, gas fee, payment method, pay button */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Price details</h2>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="text-ink">{formatUSDT(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Shipping fee</dt>
              <dd className="text-ink">{shippingFee === 0 ? "Free" : formatUSDT(shippingFee)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-signal-dark">
                <Fuel size={14} />
                Blockchain gas fee
              </dt>
              <dd className="text-ink">{formatUSDT(gasFee)}</dd>
            </div>
            <div className="flex items-start gap-1.5 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
              <Info size={13} className="mt-0.5 shrink-0" />
              Covers recording this order's escrow lock on-chain, so funds can
              be verifiably released once you confirm delivery.
            </div>
          </dl>

          <div className="my-4 h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-xl font-bold text-ink">{formatUSDT(total)}</span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={!addressId}
            className="btn-primary mt-5 w-full"
          >
            <ShieldCheck size={17} />
            Pay {formatUSDT(total)}
          </button>
        </section>
      </div>

      <ConfirmPaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        total={total}
        paymentMethodLabel={methodLabel}
        processing={processing}
      />
    </div>
  );
}
