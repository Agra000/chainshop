"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTransactions } from "@/context/TransactionContext";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatGasEstimate, formatUSDT } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { Countdown, isPast } from "@/components/common/Countdown";
import { TrackingTimeline } from "@/components/transaction/TrackingTimeline";
import { EscrowCard } from "@/components/transaction/EscrowCard";
import { RefundHistory } from "@/components/transaction/RefundHistory";
import { RefundModal } from "@/components/transaction/RefundModal";
import { AcceptOrderModal } from "@/components/transaction/AcceptOrderModal";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { toast } from "@/lib/toast";
import { OrderDetailSkeleton } from "@/components/ui/Skeleton";

function Panel({ tone = "seal", icon: Icon, title, children }) {
  const tones = {
    seal: "border-seal/30 bg-seal-soft text-seal-dark",
    ledger: "border-ledger/30 bg-ledger-soft text-ledger-dark",
    signal: "border-signal/30 bg-signal-soft text-signal-dark",
    danger: "border-danger/30 bg-danger-soft text-danger",
    plain: "border-dashed border-border text-ink-soft",
  };
  return (
    <div className={`mt-2 rounded-xl border p-4 ${tones[tone]}`}>
      <p className="flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon size={16} />}
        {title}
      </p>
      <div className="mt-1 text-xs text-ink-soft">{children}</div>
    </div>
  );
}

export default function TransactionDetailPage({ params }) {
  const { user } = useAuth();
  const {
    getTransaction,
    confirmReceived,
    requestRefund,
    returnShipped,
    returnDelivered,
    runAutoAction,
    cancelExpired,
    syncTransaction,
    cancelTransaction,
    rateItem,
    hydrated,
  } = useTransactions();
  const [busy, setBusy] = useState("");
  const [tx, setTx] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [ratings, setRatings] = useState({});
  const [refundOpen, setRefundOpen] = useState(false);
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptStep, setAcceptStep] = useState("");

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

  async function run(key, action, successMessage) {
    setBusy(key);
    try {
      const updated = await action();
      if (updated) setTx(updated);
      if (successMessage) toast.success(successMessage);
    } catch (error) {
      toast.error(getApiErrorMessage(error, error.message || "Something went wrong."));
    } finally {
      setBusy("");
    }
  }

  function handleConfirm() {
    setAcceptOpen(true);
  }

  async function handleAccept() {
    setAcceptStep("Sign the acceptance in MetaMask (free, no gas)…");
    await run(
      "confirm",
      async () => {
        const updated = await confirmReceived(tx, setAcceptStep);
        setAcceptOpen(false);
        return updated;
      },
      "Order accepted. The seller can now claim the payment.",
    );
    setAcceptStep("");
  }

  function openRefund() {
    setRefundOpen(true);
  }

  async function handleRefund(data, setStep) {
    const updated = await requestRefund(tx, data, setStep);
    if (updated) setTx(updated);
    setRefundOpen(false);
    toast.success("Refund request submitted. Waiting for admin review.");
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

  const s = tx.status;
  const canRequestMore = tx.refundCount < tx.maxRefundRequests;
  const notDeliveredRefundOpen =
    (s === "shipped" || s === "in_transit") && isPast(tx.notDeliveredRefundAt) && canRequestMore;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/transaction" />

      <div className="mb-5 mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{tx.code}</h1>
          <p className="text-sm text-ink-faint">
            Placed {formatDate(tx.createdAt)} · {tx.shopName}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-paper/60 px-3.5 py-2 text-sm">
          <Truck size={16} className="text-ink-soft" />
          <span className="text-ink">{tx.courier.name}</span>
          <span className="text-ink-faint">•</span>
          <span className="font-mono text-xs text-ink-soft">{tx.courier.trackingNumber}</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-5">
          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-semibold text-ink">Delivery status</h2>
              {tx.statusLabel && <span className="chip bg-paper text-ink-soft">{tx.statusLabel}</span>}
            </div>
            <div className="mt-4">
              <TrackingTimeline stageIndex={tx.stageIndex} stageTimestamps={tx.stageTimestamps} />
            </div>

            {s === "pending_payment" && (
              <Panel tone="plain" icon={Hourglass} title="Waiting for payment">
                The escrow deposit has not been confirmed yet.
                <button type="button" onClick={handleCancel} className="btn-secondary mt-3 w-full !py-2 text-xs">
                  Cancel order
                </button>
              </Panel>
            )}

            {(s === "paid" || s === "processing") && (
              <Panel tone="seal" icon={PackageOpen} title={s === "paid" ? "Waiting for the seller" : "Seller is packing your order"}>
                <p>The seller must hand the package to a courier before the deadline, otherwise the escrow refunds you in full.</p>
                <Countdown deadline={tx.sellerDeadlineAt} label="Ship deadline" className="mt-2" />
                {isPast(tx.sellerDeadlineAt) && (
                  <button
                    type="button"
                    onClick={() => run("auto", () => cancelExpired(tx), "Order cancelled and refunded.")}
                    disabled={!!busy}
                    className="btn-secondary mt-3 w-full !py-2 text-xs"
                  >
                    Cancel & refund now
                  </button>
                )}
              </Panel>
            )}

            {(s === "shipped" || s === "in_transit") && (
              <Panel tone="signal" icon={Truck} title={s === "in_transit" ? "Package on the way" : "Picked up by courier"}>
                {s === "in_transit" ? "Estimated arrival: tomorrow." : "The invoice of this shipment is recorded on-chain."}
                {notDeliveredRefundOpen ? (
                  <button
                    type="button"
                    onClick={() => openRefund()}
                    disabled={!!busy}
                    className="btn-secondary mt-3 w-full !py-2 text-xs"
                  >
                    <Undo2 size={14} />
                    Package not delivered? Request a refund
                  </button>
                ) : (
                  tx.notDeliveredRefundAt && (
                    <p className="mt-2 text-ink-faint">
                      If it hasn&apos;t arrived by {formatDate(tx.notDeliveredRefundAt)}, you can request a refund.
                    </p>
                  )
                )}
              </Panel>
            )}

            {s === "delivered" && (
              <Panel tone="seal" icon={PackageCheck} title="Your parcel has arrived">
                <p>
                  Check the order, then accept it or request a refund. If you don&apos;t respond in time, the order is
                  accepted automatically and the payment is released to the seller.
                </p>
                <Countdown deadline={tx.buyerDeadlineAt} label="Respond within" className="mt-2" />
                {!isPast(tx.buyerDeadlineAt) ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <button type="button" onClick={handleConfirm} disabled={!!busy} className="btn-primary w-full">
                      <PackageCheck size={17} />
                      {busy === "confirm" ? "Accepting..." : "Accept order"}
                    </button>
                    {canRequestMore ? (
                      <button
                        type="button"
                        onClick={() => openRefund()}
                        disabled={!!busy}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft py-2 text-sm font-medium text-danger transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white"
                      >
                        <Undo2 size={15} />
                        Request refund ({tx.refundCount}/{tx.maxRefundRequests} used)
                      </button>
                    ) : (
                      <p className="text-ink-faint">You have used all {tx.maxRefundRequests} refund requests.</p>
                    )}
                  </div>
                ) : (
                  <p className="mt-2">The response window has passed. The payment will be released to the seller automatically.</p>
                )}
              </Panel>
            )}

            {s === "refund_requested" && (
              <Panel tone="signal" icon={Hourglass} title="Refund request under review">
                An admin is reviewing your request (attempt {tx.refundCount} of {tx.maxRefundRequests}). The confirmation
                timer is paused until a decision is made.
              </Panel>
            )}

            {s === "return_pending" && (
              <Panel tone="seal" icon={Undo2} title="Refund approved — ship the item back">
                <p>Pack the item and hand it to a courier. The refund is paid once the seller receives it.</p>
                <Countdown deadline={tx.returnDeadlineAt} label="Ship the return within" className="mt-2" />
                {!isPast(tx.returnDeadlineAt) ? (
                  <button
                    type="button"
                    onClick={() => run("return-ship", () => returnShipped(tx), "Return shipment recorded.")}
                    disabled={!!busy}
                    className="btn-primary mt-3 w-full"
                  >
                    <Truck size={17} />
                    {busy === "return-ship" ? "Recording..." : "I've shipped the item back"}
                  </button>
                ) : (
                  <p className="mt-2 text-danger">The return deadline has passed, so the refund is cancelled.</p>
                )}
              </Panel>
            )}

            {s === "return_shipped" && (
              <Panel tone="signal" icon={Truck} title="Return on the way">
                <p>
                  Return tracking <span className="font-mono">{tx.returnTrackingNumber}</span> · estimated arrival: tomorrow.
                </p>
                <button
                  type="button"
                  onClick={() => run("return-arrive", () => returnDelivered(tx), "Return marked as arrived.")}
                  disabled={!!busy}
                  className="btn-secondary mt-3 w-full !py-2 text-xs"
                >
                  {busy === "return-arrive" ? "Recording..." : "Return arrived at the seller"}
                </button>
              </Panel>
            )}

            {s === "return_delivered" && (
              <Panel tone="signal" icon={Hourglass} title="Waiting for the seller to confirm the return">
                <p>If the seller doesn&apos;t confirm in time, the refund is sent to you automatically.</p>
                <Countdown deadline={tx.returnDeadlineAt} label="Seller confirms within" className="mt-2" />
                {isPast(tx.returnDeadlineAt) && (
                  <button
                    type="button"
                    onClick={() => run("auto", () => runAutoAction(tx), "Refund sent to your wallet.")}
                    disabled={!!busy}
                    className="btn-primary mt-3 w-full"
                  >
                    Claim refund now
                  </button>
                )}
              </Panel>
            )}

            {s === "accepted" && (
              <Panel tone="ledger" icon={PackageCheck} title="You accepted this order">
                Accepted {formatDate(tx.acceptedAt)} with a free signature (no gas). The payment stays in escrow until the
                seller claims it, and it can only go to the seller now. Refunds are no longer available for this order.
              </Panel>
            )}

            {s === "completed" && (
              <Panel tone="ledger" icon={ShieldCheck} title="Payment released to the seller">
                Completed {formatDate(tx.completedAt)}.
              </Panel>
            )}

            {s === "refunded" && (
              <Panel tone="ledger" icon={CheckCircle2} title="Refund completed">
                {formatUSDT(tx.itemsTotal + tx.shippingFee)} (items + shipping) returned to your wallet. The gas estimate
                was paid to the seller.
              </Panel>
            )}

            {s === "cancelled" && (
              <Panel tone="danger" icon={AlertTriangle} title="Order cancelled">
                {tx.trackings[tx.trackings.length - 1]?.note || "This order has been cancelled."}
              </Panel>
            )}

            <button
              type="button"
              onClick={() => run("sync", () => syncTransaction(tx))}
              disabled={!!busy}
              className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-ink-soft hover:text-ink"
            >
              <RefreshCw size={13} className={busy === "sync" ? "animate-spin" : ""} />
              Refresh from blockchain
            </button>
          </section>

          {tx.trackings.length > 0 && (
            <section className="card p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold text-ink">Activity</h2>
              <ul className="mt-3 flex flex-col gap-2.5">
                {[...tx.trackings].reverse().map((t, i) => (
                  <li key={i} className="text-xs">
                    <p className="text-ink">{t.note || t.status}</p>
                    <p className="text-ink-faint">
                      {formatDate(t.createdAt)}
                      {t.location ? ` · ${t.location}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">Items ({tx.items.length})</h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {tx.items.map((item) => (
                <div key={item.orderItemId} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink-faint">
                      {item.qty} × {formatUSDT(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-ink">{formatUSDT(item.lineTotal ?? item.qty * item.price)}</p>
                  {s === "completed" && !item.isReviewed && (
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
                            className={n <= (ratings[item.orderItemId] || 0) ? "fill-seal text-seal" : "text-ink-faint"}
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
                <span>{formatUSDT(tx.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping fee</span>
                <span>{tx.shippingFee === 0 ? "Free" : formatUSDT(tx.shippingFee)}</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Gas estimate (to seller)</span>
                <span>{formatGasEstimate(tx.gasFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-medium text-ink">
                <span>Total paid</span>
                <span>{formatUSDT(tx.total, { maxDecimals: 4 })}</span>
              </div>
              <p className="text-xs text-ink-faint">via {tx.paymentMethod}</p>
            </div>
          </section>

          <InvoiceCard tx={tx} />
          <RefundHistory refunds={tx.refunds} max={tx.maxRefundRequests} />
          <EscrowCard tx={tx} viewer="buyer" />
        </div>
      </div>

      <AcceptOrderModal
        open={acceptOpen}
        onClose={() => setAcceptOpen(false)}
        onConfirm={handleAccept}
        tx={tx}
        processing={busy === "confirm"}
        step={acceptStep}
      />

      <RefundModal
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        onSubmit={handleRefund}
        tx={tx}
        userId={user?.userId}
      />
    </div>
  );
}
