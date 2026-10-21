"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, Fuel, Info, LogIn, PackageOpen, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTransactions } from "@/context/TransactionContext";
import { useAuth } from "@/context/AuthContext";
import {
  formatUSDT,
  estimateGasFee,
  DEMO_STABLECOIN_BALANCE,
} from "@/lib/format";
import { AuthModal } from "@/components/layout/AuthModal";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { PaymentMethodSelector, PAYMENT_METHODS } from "@/components/payment/PaymentMethodSelector";
import { ConfirmPaymentModal } from "@/components/payment/ConfirmPaymentModal";

export default function PaymentPage() {
  const router = useRouter();
  const { selectedItems, checkoutSelected, hydrated } = useCart();
  const { createTransaction } = useTransactions();
  const { user, connectWallet, updateProfile } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [method, setMethod] = useState(PAYMENT_METHODS[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.qty * it.price, 0),
    [selectedItems]
  );
  const allDigital = selectedItems.length > 0 && selectedItems.every((it) => it.category === "topup");
  const shippingFee = allDigital || subtotal === 0 ? 0 : 1;
  const gasFee = useMemo(() => estimateGasFee(subtotal || 0), [subtotal]);
  const total = subtotal + shippingFee + gasFee;

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "";

  const walletConnected = !!user && (user.walletConnected || user.authMethod === "wallet");
  const balance = user?.stablecoinBalance ?? DEMO_STABLECOIN_BALANCE;
  const insufficient = walletConnected && balance < total;

  // Validation order: login -> connect wallet -> enough balance.
  function handlePayClick() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!walletConnected) {
      connectWallet();
      return;
    }
    if (insufficient) return;
    setModalOpen(true);
  }

  function handleConfirm() {
    if (!walletConnected || balance < total) {
      setModalOpen(false);
      return;
    }
    setProcessing(true);
    // Simulated confirmation delay — this is where a real escrow contract
    // call (deposit + lock funds) would be awaited instead.
    window.setTimeout(() => {
      updateProfile({ stablecoinBalance: balance - total });
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
                  {formatUSDT(item.qty * item.price)}
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
            <span className="text-right">
              <span className="block font-display text-xl font-bold text-ink">
                {formatUSDT(total)}
              </span>
            </span>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
            <PaymentMethodSelector value={method} onChange={setMethod} />
            <p className="mt-2 text-xs text-ink-faint">
              Only stablecoin is accepted. The gas fee is paid by you and included in the total.
            </p>
          </div>

          {!user && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-signal-soft px-3 py-2.5 text-xs text-signal-dark">
              <LogIn size={14} className="mt-0.5 shrink-0" />
              Please log in and connect your wallet before paying.
            </div>
          )}
          {user && !walletConnected && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-signal-soft px-3 py-2.5 text-xs text-signal-dark">
              <Wallet size={14} className="mt-0.5 shrink-0" />
              Your wallet isn't connected. Connect a wallet to pay with stablecoin.
            </div>
          )}
          {walletConnected && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-paper/70 px-3 py-2.5 text-xs text-ink-soft">
              <span>Your balance</span>
              <span className="font-semibold text-ink">{formatUSDT(balance)}</span>
            </div>
          )}
          {insufficient && (
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Insufficient balance. You need {formatUSDT(total - balance)} more to cover the
              total including gas fee.
            </div>
          )}

          <button
            type="button"
            onClick={handlePayClick}
            disabled={insufficient}
            className="btn-primary mt-5 w-full"
          >
            {!user ? <LogIn size={17} /> : !walletConnected ? <Wallet size={17} /> : <ShieldCheck size={17} />}
            {!user
              ? "Log in to pay"
              : !walletConnected
                ? "Connect wallet"
                : insufficient
                  ? "Insufficient balance"
                  : `Pay ${formatUSDT(total)}`}
          </button>
        </section>
      </div>

      <AuthModal open={authOpen} mode="login" onClose={() => setAuthOpen(false)} />
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
