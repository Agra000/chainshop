"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Fuel, Info, PackageOpen, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTransactions } from "@/context/TransactionContext";
import { formatIDR, estimateGasFeeIDR } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { PaymentMethodSelector, PAYMENT_METHODS } from "@/components/payment/PaymentMethodSelector";
import { ConfirmPaymentModal } from "@/components/payment/ConfirmPaymentModal";

export default function PaymentPage() {
  const router = useRouter();
  const { selectedItems, checkoutSelected, hydrated } = useCart();
  const { createTransaction } = useTransactions();

  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems]
  );
  const allDigital = selectedItems.length > 0 && selectedItems.every((it) => it.category === "topup");
  const shippingFee = allDigital || subtotal === 0 ? 0 : 15000;
  const gasFee = useMemo(() => estimateGasFeeIDR(subtotal || 0), [subtotal]);
  const total = subtotal + shippingFee + gasFee;

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "";

  function handleConfirm() {
    setProcessing(true);
    // Simulated confirmation delay — this is where a real escrow contract
    // call (deposit + lock funds) would be awaited instead.
    window.setTimeout(() => {
      const purchased = checkoutSelected();
      const tx = createTransaction({
        items: purchased,
        subtotal,
        shippingFee,
        gasFee,
        total,
        paymentMethod: methodLabel,
      });
      setProcessing(false);
      setModalOpen(false);
      router.push(`/transaction/${tx.id}`);
    }, 1100);
  }

  if (!hydrated) return null;

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
                  {formatIDR(item.qty * item.price)}
                </p>
              </div>
            ))}
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
              <dd className="text-ink">{formatIDR(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Shipping fee</dt>
              <dd className="text-ink">{shippingFee === 0 ? "Free" : formatIDR(shippingFee)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-signal-dark">
                <Fuel size={14} />
                Blockchain gas fee
              </dt>
              <dd className="text-ink">{formatIDR(gasFee)}</dd>
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
            <span className="font-display text-xl font-bold text-ink">{formatIDR(total)}</span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary mt-5 w-full"
          >
            <ShieldCheck size={17} />
            Pay {formatIDR(total)}
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
