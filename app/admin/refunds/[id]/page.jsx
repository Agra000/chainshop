"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Scale, ShieldAlert, XCircle } from "lucide-react";
import { RefundDecisionModal } from "@/components/admin/RefundDecisionModal";
import { useAuth } from "@/context/AuthContext";
import { mapOrderDetail, toIsoDate } from "@/context/TransactionContext";
import { refundService } from "@/services/RefundService";
import {
  adminRefundOnchain,
  getChainErrorMessage,
  getOnchainOrder,
  getWallet,
  hasAdminRole,
} from "@/lib/blockchain";
import { formatDate, formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { TxLink } from "@/components/common/TxLink";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { RefundHistory } from "@/components/transaction/RefundHistory";
import { EscrowCard } from "@/components/transaction/EscrowCard";
import { OrderDetailSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";

export default function AdminRefundDetailPage({ params }) {
  const { user, hydrated } = useAuth();
  const [refund, setRefund] = useState(null);
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [decision, setDecision] = useState(null); // "approve" | "reject" | null (modal)
  const [busy, setBusy] = useState("");
  const [step, setStep] = useState("");

  const load = useCallback(async () => {
    if (!user?.userId) return;
    const res = await refundService.AdminDetail(user.userId, params.id);
    if (res.status) {
      setRefund(res.refund);
      setOrder(res.order ? mapOrderDetail(res.order) : null);
    }
    setLoaded(true);
  }, [user?.userId, params.id]);

  useEffect(() => {
    if (!hydrated) return;
    load().catch(() => setLoaded(true));
  }, [hydrated, load]);

  // dipanggil dari RefundDecisionModal
  async function decide(note) {
    const approve = decision === "approve";
    const verb = decision;
    // hanya approve refund "barang tak sampai" yang memindahkan dana onchain; sisanya off-chain tanpa gas
    const needsChain = approve && refund.notDelivered;

    setBusy(verb);
    try {
      let txHash = null;
      if (needsChain) {
        setStep("Checking admin wallet…");
        const { account } = await getWallet();
        if (!(await hasAdminRole(account))) {
          throw new Error(`Wallet ${shortenAddress(account)} does not have ADMIN_ROLE in the escrow contract.`);
        }

        const order_ = await getOnchainOrder(order.onchainOrderId).catch(() => null);
        if (order_?.statusName === "Refunded") {
          // refund sudah terkirim sebelumnya, tinggal simpan keputusan (backend memverifikasi state onchain)
          txHash = null;
        } else {
          setStep("Confirm the refund in MetaMask…");
          const onchain = await adminRefundOnchain(order.onchainOrderId);
          txHash = onchain.txHash;
        }
      }

      setStep("Saving decision…");
      const res = await refundService.AdminDecide(user.userId, refund.id, {
        approve,
        note: note || null,
        txHash,
      });
      if (!res.status) throw new Error(res.message);

      toast.success(res.message);
      setDecision(null);
      await load();
    } catch (error) {
      toast.error(getChainErrorMessage(error, "Failed to submit decision."));
    } finally {
      setBusy("");
      setStep("");
    }
  }

  if (!hydrated || !loaded) return <OrderDetailSkeleton />;

  if (!refund || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/admin/refunds" />
        <div className="mt-3">
          <EmptyState
            icon={<Scale size={26} />}
            title="Refund request not found"
            actionLabel="Back to list"
            actionHref="/admin/refunds"
          />
        </div>
      </div>
    );
  }

  const invoiceMatches = !!order.invoiceTxHash && refund.invoiceTxHash?.toLowerCase() === order.invoiceTxHash.toLowerCase();
  const pending = refund.status === "pending" && order.status === "refund_requested";

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/admin/refunds" />
      <div className="mb-5 mt-1">
        <h1 className="font-display text-xl font-semibold text-ink">
          Refund #{refund.attempt} · {order.code}
        </h1>
        <p className="text-sm text-ink-faint">
          {order.buyerName} → {order.shopName} · requested {formatDate(toIsoDate(refund.createdAt))}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-5">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">Buyer&apos;s request</h2>
            {refund.notDelivered && (
              <p className="mt-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
                Package not delivered 7 days after shipping. If approved, the refund is paid immediately (no return).
              </p>
            )}
            <p className="mt-3 whitespace-pre-line text-sm text-ink">{refund.reason}</p>
            {refund.photoUrl && (
              <a href={refund.photoUrl} target="_blank" rel="noreferrer" className="mt-3 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={refund.photoUrl} alt="Refund evidence" className="max-h-64 w-full rounded-xl border border-border object-cover" />
              </a>
            )}

            <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-faint">Invoice tx (from buyer)</dt>
                <dd className="flex items-center gap-1.5">
                  <TxLink hash={refund.invoiceTxHash} chars={5} />
                  {invoiceMatches ? (
                    <CheckCircle2 size={14} className="text-ledger" />
                  ) : (
                    <XCircle size={14} className="text-danger" />
                  )}
                </dd>
              </div>
              {refund.requestTxHash && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-faint">Request tx</dt>
                <dd>
                  <TxLink hash={refund.requestTxHash} chars={5} />
                </dd>
              </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-faint">Courier / tracking</dt>
                <dd className="text-ink">
                  {order.courier.name} · <span className="font-mono">{order.courier.trackingNumber}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-ink-faint">Delivered</dt>
                <dd className="text-ink">{formatDate(order.deliveredAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
              <Scale size={17} className="text-ink-soft" />
              Decision
            </h2>
            <dl className="mt-3 flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-ink-soft">
                <dt>Refund to buyer (items + shipping)</dt>
                <dd className="font-medium text-ink">{formatUSDT(order.itemsTotal + order.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Gas estimate (stays with seller)</dt>
                <dd>{formatGasEstimate(order.gasFee)}</dd>
              </div>
            </dl>

            {pending ? (
              <>
                <ul className="mt-3 list-disc pl-5 text-xs text-ink-soft">
                  <li>
                    <strong>Approve</strong>:{" "}
                    {refund.notDelivered
                      ? "refund is paid to the buyer right away."
                      : "the buyer must ship the item back within 3 days; the refund is paid when the seller confirms (or automatically 3 days after the return arrives)."}
                  </li>
                  <li>
                    <strong>Reject</strong>: the order continues and the buyer&apos;s timer resumes from the remaining time.
                    The buyer can request again ({order.refundCount}/{order.maxRefundRequests} used).
                  </li>
                </ul>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setDecision("reject")} disabled={!!busy} className="btn-secondary flex-1">
                    {busy === "reject" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                    Reject
                  </button>
                  <button type="button" onClick={() => setDecision("approve")} disabled={!!busy} className="btn-primary flex-1">
                    {busy === "approve" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Approve
                  </button>
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-[11px] text-ink-faint">
                  <ShieldAlert size={12} className="mt-0.5 shrink-0" />
                  {refund.notDelivered
                    ? "Approving pays the refund on-chain: use the MetaMask wallet that has ADMIN_ROLE in the escrow contract."
                    : "Approve and reject are recorded off-chain, no MetaMask transaction needed."}
                </p>
              </>
            ) : (
              <p className="mt-3 rounded-lg bg-paper/70 px-3 py-2 text-xs text-ink-soft">
                Status: <span className="font-medium text-ink">{refund.status}</span>
                {refund.adminNote ? ` · ${refund.adminNote}` : ""}
                {refund.decisionTxHash && (
                  <>
                    {" "}
                    · <TxLink hash={refund.decisionTxHash} chars={4} />
                  </>
                )}
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          <InvoiceCard tx={order} />
          <RefundHistory refunds={order.refunds} max={order.maxRefundRequests} />
          <EscrowCard tx={order} viewer="admin" />
        </div>
      </div>

      <RefundDecisionModal
        open={!!decision}
        mode={decision}
        onClose={() => setDecision(null)}
        onConfirm={decide}
        order={order}
        refund={refund}
        processing={!!busy}
        step={step}
      />
    </div>
  );
}
