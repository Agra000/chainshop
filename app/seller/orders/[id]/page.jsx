"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Hourglass,
  Loader2,
  MapPin,
  Navigation,
  PackageCheck,
  PackageOpen,
  PackageX,
  RefreshCw,
  ShieldCheck,
  Truck,
  Undo2,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mapOrderDetail } from "@/context/TransactionContext";
import { orderService } from "@/services/OrderService";
import { courierService } from "@/services/CourierService";
import {
  claimPaymentOnchain,
  getChainErrorMessage,
  getOnchainOrder,
  markShippedOnchain,
  sellerRefundOnchain,
} from "@/lib/blockchain";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatGasEstimate, formatUSDT } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { Countdown, isPast } from "@/components/common/Countdown";
import { TrackingTimeline } from "@/components/transaction/TrackingTimeline";
import { EscrowCard } from "@/components/transaction/EscrowCard";
import { RefundHistory } from "@/components/transaction/RefundHistory";
import { InvoiceCard } from "@/components/invoice/InvoiceCard";
import { RejectOrderModal } from "@/components/seller/RejectOrderModal";
import { ConfirmReturnModal } from "@/components/seller/ConfirmReturnModal";
import { ClaimPaymentModal } from "@/components/seller/ClaimPaymentModal";
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

export default function SellerOrderDetailPage({ params }) {
  const { user, hydrated } = useAuth();
  const sellerId = user?.storeId;

  const [tx, setTx] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState("");
  const [step, setStep] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const [manualTx, setManualTx] = useState("");

  const [couriers, setCouriers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [ship, setShip] = useState({ courierId: "", driverId: "" });

  const loadOrder = useCallback(async () => {
    if (!sellerId) return null;
    const res = await orderService.GetOrderDetail(params.id, { sellerId });
    const data = res.status ? mapOrderDetail(res.data) : null;
    setTx(data);
    setLoaded(true);
    return data;
  }, [sellerId, params.id]);

  useEffect(() => {
    if (!hydrated) return;
    loadOrder().catch(() => setLoaded(true));
  }, [hydrated, loadOrder]);

  useEffect(() => {
    if (tx?.status !== "processing") return;
    courierService.GetAllCourier().then((res) => setCouriers(res.data || []));
  }, [tx?.status]);

  useEffect(() => {
    if (!ship.courierId) return setDrivers([]);
    courierService.GetDrivers(ship.courierId).then((res) => setDrivers(res.data || []));
  }, [ship.courierId]);

  async function run(key, action, successMessage) {
    setBusy(key);
    try {
      const res = await action();
      if (res && res.status === false) {
        toast.error(res.message);
        return;
      }
      if (successMessage) toast.success(successMessage);
      await loadOrder();
    } catch (error) {
      toast.error(getChainErrorMessage(error, getApiErrorMessage(error)));
      await loadOrder().catch(() => {});
    } finally {
      setBusy("");
      setStep("");
    }
  }

  function handleAccept() {
    return run("process", () => orderService.ProcessOrder(sellerId, tx.id), "Order accepted.");
  }

  function handleReject() {
    setRejectOpen(true);
  }

  function handleRejectConfirm(note) {
    return run(
      "reject",
      async () => {
        setStep("Confirm the cancellation in MetaMask…");
        const onchain = await sellerRefundOnchain(tx.onchainOrderId, tx.sellerWallet);
        setStep("Saving…");
        const res = await orderService.RejectOrder(sellerId, tx.id, { txHash: onchain.txHash, note });
        if (res?.status !== false) setRejectOpen(false);
        return res;
      },
      "Order rejected, buyer refunded.",
    );
  }

  const pendingShipKey = `chainshop_pending_ship_${params.id}`;

  function readPendingShip() {
    try {
      return window.localStorage.getItem(pendingShipKey) || "";
    } catch (e) {
      return "";
    }
  }

  function writePendingShip(value) {
    try {
      if (value) window.localStorage.setItem(pendingShipKey, value);
      else window.localStorage.removeItem(pendingShipKey);
    } catch (e) {
      // abaikan
    }
  }

  function handleShip(e) {
    e?.preventDefault();
    return run(
      "ship",
      async () => {
        // invoice sudah tercatat onchain tapi backend belum menyimpannya -> selesaikan saja
        const pending = readPendingShip();
        if (pending) {
          setStep("Saving shipment…");
          const res = await orderService.ShipOrder(sellerId, tx.id, { invoiceTxHash: pending });
          if (res.status) writePendingShip("");
          return res;
        }

        // 1. backend generate nomor resi + invoice id
        setStep("Generating tracking number & invoice…");
        const prepared = await orderService.PrepareShipment(sellerId, tx.id, { driverId: ship.driverId });
        if (!prepared.status) return prepared;

        // 2. invoice dicatat on-chain (event InvoiceRecorded)
        setStep(`Record invoice ${prepared.data.invoiceId} in MetaMask…`);
        const onchain = await markShippedOnchain(prepared.data, tx.sellerWallet);
        writePendingShip(onchain.txHash);

        // 3. tandai order dikirim di backend
        setStep("Saving shipment…");
        const res = await orderService.ShipOrder(sellerId, tx.id, { invoiceTxHash: onchain.txHash });
        if (res.status) writePendingShip("");
        return res;
      },
      "Order shipped, invoice recorded on-chain.",
    );
  }

  function handleInTransit() {
    return run(
      "in_transit",
      () => orderService.UpdateShipping(sellerId, tx.id, { status: "in_transit", note: "Package is on the way, estimated arrival: tomorrow" }),
      "Status updated: on the way.",
    );
  }

  // barang sampai (simulasi kurir, off-chain, tanpa MetaMask) -> timer buyer dimulai
  function handleArrived() {
    return run(
      "delivered",
      () => orderService.UpdateShipping(sellerId, tx.id, { status: "delivered", note: "Package arrived at destination" }),
      "Marked as arrived. The buyer can now accept or request a refund.",
    );
  }

  function handleConfirmReturn() {
    setReturnOpen(true);
  }

  function handleConfirmReturnSubmit() {
    return run(
      "return",
      async () => {
        setStep("Confirm in MetaMask…");
        const onchain = await sellerRefundOnchain(tx.onchainOrderId, tx.sellerWallet);
        setStep("Saving…");
        const res = await orderService.Sync(tx.id, onchain?.txHash);
        if (res?.status !== false) setReturnOpen(false);
        return res;
      },
      "Return confirmed, refund sent to the buyer.",
    );
  }

  // v3: buyer sudah menandatangani persetujuan -> seller klaim dana sendiri (gas dibayar seller)
  function handleClaimSubmit() {
    return run(
      "claim",
      async () => {
        if (!tx.buyerAcceptSignature) return { status: false, message: "The buyer's acceptance signature is missing." };

        // klaim sebelumnya sudah masuk onchain tapi belum tersimpan -> cukup sinkronkan
        const current = await getOnchainOrder(tx.onchainOrderId).catch(() => null);
        if (current?.statusName === "Completed") {
          setStep("Saving…");
          const synced = await orderService.Sync(tx.id);
          if (synced?.status !== false) setClaimOpen(false);
          return synced;
        }

        setStep("Confirm the claim in MetaMask…");
        const onchain = await claimPaymentOnchain(tx.onchainOrderId, tx.buyerAcceptSignature, tx.sellerWallet);
        setStep("Saving…");
        const res = await orderService.ClaimPayment(sellerId, tx.id, { txHash: onchain.txHash });
        if (res?.status !== false) setClaimOpen(false);
        return res;
      },
      "Payment claimed, the money is now in your wallet.",
    );
  }

  // aksi otomatis yang sudah jatuh tempo, dijalankan backend (gas dibayar wallet operator)
  function handleAuto(message) {
    return run("auto", () => orderService.RunAuto(tx.id), message);
  }

  if (!hydrated || !loaded) return <OrderDetailSkeleton />;

  if (!tx) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
        <BackButton fallbackHref="/seller/orders" />
        <div className="mt-3">
          <EmptyState
            icon={<PackageCheck size={26} />}
            title="Order not found"
            description="This order may not belong to your shop, or the link is incorrect."
            actionLabel="View order list"
            actionHref="/seller/orders"
          />
        </div>
      </div>
    );
  }

  const s = tx.status;
  const canReject = (s === "paid" || s === "processing") && !isPast(tx.sellerDeadlineAt);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/seller/orders" />

      <div className="mb-5 mt-1 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">{tx.code}</h1>
          <p className="text-sm text-ink-faint">
            Placed {formatDate(tx.createdAt)} · {tx.buyerName}
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

            {busy && step && busy !== "reject" && busy !== "return" && (
              <p className="mt-2 flex items-center gap-2 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
                <Loader2 size={14} className="animate-spin" />
                {step}
              </p>
            )}

            {s === "paid" && (
              <Panel tone="seal" icon={PackageOpen} title="New paid order">
                <p>Payment is held in escrow. Accept the order, then hand it to a courier before the deadline.</p>
                <Countdown deadline={tx.sellerDeadlineAt} label="Accept & ship within" className="mt-2" />
                <button type="button" onClick={handleAccept} disabled={!!busy || isPast(tx.sellerDeadlineAt)} className="btn-primary mt-3 w-full">
                  {busy === "process" ? <Loader2 size={17} className="animate-spin" /> : <PackageCheck size={17} />}
                  Accept order
                </button>
              </Panel>
            )}

            {s === "processing" && (
              <form onSubmit={handleShip} className="mt-2 flex flex-col gap-2.5 rounded-xl border border-seal/30 bg-seal-soft p-4">
                <p className="text-sm font-medium text-seal-dark">Send to shipper</p>
                <p className="text-xs text-ink-soft">
                  Choose the courier and driver. The tracking number is generated automatically, and the invoice (items,
                  prices, fees, courier, tracking number) is recorded on-chain when you ship.
                </p>
                <Countdown deadline={tx.sellerDeadlineAt} label="Ship within" />
                <select
                  value={ship.courierId}
                  onChange={(e) => setShip({ courierId: e.target.value, driverId: "" })}
                  className="input-field bg-surface"
                  required
                >
                  <option value="" disabled>
                    Select a courier…
                  </option>
                  {couriers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.activeDrivers} drivers)
                    </option>
                  ))}
                </select>
                <select
                  value={ship.driverId}
                  onChange={(e) => setShip((x) => ({ ...x, driverId: e.target.value }))}
                  className="input-field bg-surface"
                  required
                >
                  <option value="" disabled>
                    Select a driver…
                  </option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} · {d.vehicleType || "-"} {d.plateNumber || ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-ink-faint">
                  This is your only on-chain transaction for this order. Its gas is covered by the buyer&apos;s gas estimate
                  ({formatGasEstimate(tx.gasFee)}), paid to you when the order completes or is refunded.
                </p>
                <button type="submit" disabled={!!busy || isPast(tx.sellerDeadlineAt)} className="btn-primary w-full">
                  {busy === "ship" ? <Loader2 size={17} className="animate-spin" /> : <Truck size={17} />}
                  Ship &amp; record invoice
                </button>
              </form>
            )}

            {(s === "shipped" || s === "in_transit") && !tx.invoiceTxHash && (
              <Panel tone="danger" icon={AlertTriangle} title="Invoice transaction not saved yet">
                <p>The invoice is on-chain but the backend has not stored its transaction ID.</p>
                {!readPendingShip() && (
                  <input
                    value={manualTx}
                    onChange={(e) => setManualTx(e.target.value.trim())}
                    className="input-field mt-3 font-mono text-xs"
                    placeholder="Paste the markShipped tx hash (0x…) from MetaMask activity / Etherscan"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!readPendingShip() && manualTx) writePendingShip(manualTx);
                    handleShip();
                  }}
                  disabled={!!busy || (!readPendingShip() && !/^0x[0-9a-fA-F]{64}$/.test(manualTx))}
                  className="btn-primary mt-3 w-full"
                >
                  Finish saving shipment
                </button>
              </Panel>
            )}

            {(s === "shipped" || s === "in_transit") && (
              <Panel tone="signal" icon={Truck} title="Shipping (simulation)">
                <p>Move the package along (no MetaMask needed). &quot;Arrived&quot; starts the buyer&apos;s window to accept or request a refund.</p>
                <div className="mt-3 flex gap-2">
                  {s === "shipped" && (
                    <button type="button" onClick={handleInTransit} disabled={!!busy} className="btn-secondary flex-1 !py-2 text-xs">
                      {busy === "in_transit" ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                      On the way
                    </button>
                  )}
                  <button type="button" onClick={handleArrived} disabled={!!busy} className="btn-primary flex-1 !py-2 text-xs">
                    {busy === "delivered" ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                    Arrived at buyer
                  </button>
                </div>
              </Panel>
            )}

            {s === "delivered" && (
              <Panel tone="seal" icon={Hourglass} title="Waiting for the buyer">
                <p>The buyer can accept or request a refund. No response in time = accepted automatically.</p>
                <Countdown deadline={tx.buyerDeadlineAt} label="Buyer responds within" className="mt-2" />
                {isPast(tx.buyerDeadlineAt) && (
                  <button
                    type="button"
                    onClick={() => handleAuto("Payment released to your wallet.")}
                    disabled={!!busy}
                    className="btn-primary mt-3 w-full"
                  >
                    Release payment now
                  </button>
                )}
              </Panel>
            )}

            {s === "refund_requested" && (
              <Panel tone="signal" icon={Hourglass} title="Buyer requested a refund">
                An admin is reviewing the request. Funds stay locked until a decision is made.
              </Panel>
            )}

            {s === "return_pending" && (
              <Panel tone="signal" icon={Undo2} title="Refund approved — waiting for the return">
                <p>The buyer must ship the item back before the deadline, otherwise the payment is released to you.</p>
                <Countdown deadline={tx.returnDeadlineAt} label="Buyer ships within" className="mt-2" />
                {isPast(tx.returnDeadlineAt) && (
                  <button
                    type="button"
                    onClick={() => handleAuto("Refund cancelled, payment released to you.")}
                    disabled={!!busy}
                    className="btn-primary mt-3 w-full"
                  >
                    Release payment now
                  </button>
                )}
              </Panel>
            )}

            {(s === "return_shipped" || s === "return_delivered") && (
              <Panel tone="seal" icon={Undo2} title={s === "return_shipped" ? "Return on the way" : "Returned item arrived"}>
                <p>
                  Return tracking <span className="font-mono">{tx.returnTrackingNumber}</span>. Confirm once you receive it;
                  the buyer gets {formatUSDT(tx.itemsTotal + tx.shippingFee)} and you keep the gas estimate.
                </p>
                {s === "return_delivered" && (
                  <Countdown deadline={tx.returnDeadlineAt} label="Confirm within" className="mt-2" />
                )}
                <button type="button" onClick={handleConfirmReturn} disabled={!!busy} className="btn-primary mt-3 w-full">
                  {busy === "return" ? <Loader2 size={17} className="animate-spin" /> : <PackageCheck size={17} />}
                  Returned item received
                </button>
              </Panel>
            )}

            {s === "accepted" && (
              <Panel tone="ledger" icon={Wallet} title="Buyer accepted, claim your payment">
                <p>
                  {tx.buyerName || "The buyer"} accepted the order {tx.acceptedAt ? `on ${formatDate(tx.acceptedAt)} ` : ""}
                  with a signed message. Claim {formatUSDT(tx.total, { maxDecimals: 4 })} from the escrow whenever you
                  are ready (1 MetaMask transaction, gas paid by you and covered by the gas estimate).
                </p>
                <button type="button" onClick={() => setClaimOpen(true)} disabled={!!busy} className="btn-primary mt-3 w-full">
                  {busy === "claim" ? <Loader2 size={17} className="animate-spin" /> : <Wallet size={17} />}
                  Claim payment
                </button>
              </Panel>
            )}

            {s === "completed" && (
              <Panel tone="ledger" icon={ShieldCheck} title="Payment released to your wallet">
                {formatUSDT(tx.total, { maxDecimals: 4 })} (items + shipping + gas estimate) · {formatDate(tx.completedAt)}
              </Panel>
            )}

            {s === "refunded" && (
              <Panel tone="ledger" icon={CheckCircle2} title="Order refunded">
                The buyer received the items + shipping amount. The gas estimate ({formatGasEstimate(tx.gasFee)}) was paid to you.
              </Panel>
            )}

            {s === "cancelled" && (
              <Panel tone="danger" icon={AlertTriangle} title="Order cancelled">
                {tx.trackings[tx.trackings.length - 1]?.note || "This order has been cancelled."}
              </Panel>
            )}

            {canReject && (
              <button
                type="button"
                onClick={handleReject}
                disabled={!!busy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger-soft py-2 text-sm font-medium text-danger transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white active:scale-[0.97]"
              >
                <PackageX size={15} />
                Reject &amp; refund buyer
              </button>
            )}

            <button
              type="button"
              onClick={() => run("sync", () => orderService.Sync(tx.id))}
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
                <div key={item.orderItemId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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
                </div>
              ))}
            </div>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3 text-sm">
              <div className="flex justify-between text-ink-soft">
                <dt>Items</dt>
                <dd>{formatUSDT(tx.itemsTotal)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Shipping fee</dt>
                <dd>{formatUSDT(tx.shippingFee)}</dd>
              </div>
              <div className="flex justify-between text-ink-soft">
                <dt>Gas estimate (for you)</dt>
                <dd>{formatGasEstimate(tx.gasFee)}</dd>
              </div>
              <div className="flex justify-between font-medium text-ink">
                <dt>Held in escrow</dt>
                <dd>{formatUSDT(tx.total, { maxDecimals: 4 })}</dd>
              </div>
            </dl>
            {tx.address && (
              <p className="mt-3 text-xs text-ink-soft">
                Ship to <span className="font-medium text-ink">{tx.address.recipientName}</span> ({tx.address.phone}) —{" "}
                {tx.address.fullAddress}, {tx.address.city}, {tx.address.province} {tx.address.postalCode}
              </p>
            )}
          </section>

          <InvoiceCard tx={tx} />
          <RefundHistory refunds={tx.refunds} max={tx.maxRefundRequests} />
          <EscrowCard tx={tx} viewer="seller" />
        </div>
      </div>

      <ConfirmReturnModal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        onConfirm={handleConfirmReturnSubmit}
        tx={tx}
        processing={busy === "return"}
        step={step}
      />

      <ClaimPaymentModal
        open={claimOpen}
        onClose={() => setClaimOpen(false)}
        onConfirm={handleClaimSubmit}
        tx={tx}
        processing={busy === "claim"}
        step={step}
      />

      <RejectOrderModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        tx={tx}
        processing={busy === "reject"}
        step={step}
      />
    </div>
  );
}
