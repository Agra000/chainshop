"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  PackageCheck,
  ShieldCheck,
  Truck,
  RefreshCw,
  Lock,
  LockOpen,
  Star,
} from "lucide-react";
import { useTransactions, ORDER_STAGES } from "@/context/TransactionContext";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatUSDT, shortenAddress } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { TrackingTimeline } from "@/components/transaction/TrackingTimeline";
import { toast } from "@/lib/toast";
import { OrderDetailSkeleton } from "@/components/ui/Skeleton";

const ARRIVED_INDEX = ORDER_STAGES.indexOf("Arrived at Destination");
const COMPLETED_INDEX = ORDER_STAGES.indexOf("Completed");

export default function TransactionDetailPage({ params }) {
  const { getTransaction, confirmReceived, cancelTransaction, rateItem, hydrated } = useTransactions();
  const [confirming, setConfirming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tx, setTx] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [ratings, setRatings] = useState({});

  const loadOrder = useCallback(async () => {
    const data = await getTransaction(params.id);
    setTx(data);
    setLoaded(true);
    return data;
  }, [getTransaction, params.id]);

  useEffect(() => {
    if (!hydrated) return;
    loadOrder();
  }, [hydrated, loadOrder]);

  if (!hydrated || !loaded) return <OrderDetailSkeleton />;

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

  async function handleConfirm() {
    setConfirming(true);
    try {
      // escrow release onchain -> konfirmasi ke backend
      const updated = await confirmReceived(tx.id);
      if (updated) setTx(updated);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to confirm delivery."));
    } finally {
      setConfirming(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadOrder();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this unpaid order?")) return;
    try {
      await cancelTransaction(tx.id);
      await loadOrder();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to cancel order."));
    }
  }

  async function handleRate(item) {
    const rating = ratings[item.orderItemId];
    if (!rating) return;
    try {
      await rateItem(item.orderItemId, rating);
      await loadOrder();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to rate item."));
    }
  }

  const isArrived = tx.stageIndex === ARRIVED_INDEX;
  const isCompleted = tx.stageIndex === COMPLETED_INDEX;
  const isCancelled = tx.status === "cancelled";
  const isUnpaid = tx.status === "pending_payment";

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/transaction" />

      <div className="mb-5 mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{tx.code}</h1>
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
                <RefreshCw size={13} />
                {isCancelled ? "Order cancelled" : isUnpaid ? "Waiting for payment" : "Live tracking"}
              </p>
              <p className="mt-1 text-xs text-ink-faint">
                {isCancelled
                  ? tx.trackings[tx.trackings.length - 1]?.note || "This order has been cancelled."
                  : "Delivery status is updated by the seller and courier. Refresh to see the latest update."}
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary mt-3 w-full !py-2 text-xs"
              >
                {refreshing ? "Refreshing..." : "Refresh tracking"}
              </button>
              {isUnpaid && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-secondary mt-2 w-full !py-2 text-xs"
                >
                  Cancel order
                </button>
              )}
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
                <div key={item.orderItemId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">Qty {item.qty}</p>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatUSDT(item.qty * item.price)}</p>
                  {isCompleted && !item.isReviewed && (
                    <div className="flex w-full items-center gap-1 pl-[60px]">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRatings((r) => ({ ...r, [item.orderItemId]: n }))}
                          aria-label={`Rate ${n} star`}
                        >
                          <Star
                            size={16}
                            className={
                              n <= (ratings[item.orderItemId] || 0)
                                ? "fill-seal text-seal"
                                : "text-ink-faint"
                            }
                          />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleRate(item)}
                        disabled={!ratings[item.orderItemId]}
                        className="btn-secondary ml-auto !px-3 !py-1 text-xs"
                      >
                        Rate item
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{formatUSDT(tx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping fee</span>
                <span>{tx.shippingFee === 0 ? "Free" : formatUSDT(tx.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Blockchain gas fee</span>
                <span>{formatUSDT(tx.gasFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium text-ink">
                <span>Total paid</span>
                <span>{formatUSDT(tx.total)}</span>
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
                  {tx.escrow.locked
                    ? "Funds locked in contract"
                    : tx.escrow.refunded
                      ? "Funds refunded to buyer"
                      : tx.escrow.releaseTxHash
                        ? "Funds released"
                        : "Waiting for payment"}
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
              Every escrow step (lock, release, refund) is recorded with its on-chain
              transaction hash.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
