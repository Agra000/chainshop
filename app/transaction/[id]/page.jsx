"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PackageCheck,
  ShieldCheck,
  Truck,
  FlaskConical,
  Lock,
  LockOpen,
} from "lucide-react";
import { useTransactions, ORDER_STAGES } from "@/context/TransactionContext";
import { formatDate, formatIDR, shortenAddress } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { TrackingTimeline } from "@/components/transaction/TrackingTimeline";

const ARRIVED_INDEX = ORDER_STAGES.indexOf("Arrived at Destination");
const COMPLETED_INDEX = ORDER_STAGES.indexOf("Completed");

export default function TransactionDetailPage({ params }) {
  const { getTransaction, advanceStage, confirmReceived, hydrated } = useTransactions();
  const [confirming, setConfirming] = useState(false);
  const tx = hydrated ? getTransaction(params.id) : null;

  if (!hydrated) return null;

  if (!tx) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/transaction" />
        <div className="mt-3">
          <EmptyState
            icon={<PackageCheck size={26} />}
            title="Order not found"
            description="This order may have been removed, or the link is incorrect."
            actionLabel="View my transactions"
            actionHref="/transaction"
          />
        </div>
      </div>
    );
  }

  function handleConfirm() {
    setConfirming(true);
    window.setTimeout(() => {
      confirmReceived(tx.id);
      setConfirming(false);
    }, 900);
  }

  const isArrived = tx.stageIndex === ARRIVED_INDEX;
  const isCompleted = tx.stageIndex === COMPLETED_INDEX;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/transaction" />

      <div className="mb-5 mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{tx.id}</h1>
          <p className="text-sm text-ink-faint">Placed {formatDate(tx.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm">
          <Truck size={16} className="text-ink-soft" />
          <span className="text-ink">{tx.courier.name}</span>
          <span className="text-ink-faint">•</span>
          <span className="font-mono text-xs text-ink-soft">{tx.courier.trackingNumber}</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Delivery status</h2>
          <div className="mt-4">
            <TrackingTimeline stageIndex={tx.stageIndex} stageTimestamps={tx.stageTimestamps} />
          </div>

          {isArrived && (
            <div className="mt-2 rounded-xl border border-seal/30 bg-seal-soft p-4">
              <p className="text-sm font-medium text-seal-dark">Your parcel has arrived.</p>
              <p className="mt-1 text-xs text-ink-soft">
                Confirm receipt once you've checked the order — this releases your payment
                to the seller from escrow.
              </p>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={confirming}
                className="btn-primary mt-3 w-full"
              >
                <PackageCheck size={17} />
                {confirming ? "Releasing payment..." : "Confirm Item Received"}
              </button>
            </div>
          )}

          {isCompleted && (
            <div className="mt-2 flex items-start gap-3 rounded-xl border border-ledger/30 bg-ledger-soft p-4">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-ledger-dark" />
              <div>
                <p className="text-sm font-medium text-ledger-dark">
                  Payment released to seller
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Released {formatDate(tx.escrow.releasedAt)} · tx{" "}
                  <span className="font-mono">{shortenAddress(tx.escrow.releaseTxHash, 6)}</span>
                </p>
              </div>
            </div>
          )}

          {!isArrived && !isCompleted && (
            <div className="mt-2 rounded-xl border border-dashed border-border p-4">
              <p className="flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <FlaskConical size={13} />
                Demo controls
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                No courier is wired up yet, so nudge the delivery forward manually to see
                how tracking updates.
              </p>
              <button
                type="button"
                onClick={() => advanceStage(tx.id)}
                className="btn-secondary mt-3 w-full !py-2 text-xs"
              >
                Simulate next update
              </button>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-5">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">
              Items ({tx.items.length})
            </h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {tx.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">Qty {item.qty}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatIDR(item.qty * item.price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{formatIDR(tx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping fee</span>
                <span>{tx.shippingFee === 0 ? "Free" : formatIDR(tx.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Blockchain gas fee</span>
                <span>{formatIDR(tx.gasFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium text-ink">
                <span>Total paid</span>
                <span>{formatIDR(tx.total)}</span>
              </div>
              <p className="text-xs text-ink-faint">via {tx.paymentMethod}</p>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">Escrow status</h2>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-paper/70 px-4 py-3">
              {tx.escrow.locked ? (
                <Lock size={18} className="shrink-0 text-seal" />
              ) : (
                <LockOpen size={18} className="shrink-0 text-ledger" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {tx.escrow.locked ? "Funds locked in contract" : "Funds released"}
                </p>
                <p className="truncate font-mono text-xs text-ink-faint">
                  {shortenAddress(
                    tx.escrow.locked ? tx.escrow.lockTxHash : tx.escrow.releaseTxHash,
                    6
                  )}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Running on dummy data for now — this panel will reflect the real escrow
              smart contract once it's wired up.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
