"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  PackageCheck,
  PackageX,
  Truck,
  Navigation,
  MapPin,
  FileCheck2,
  Loader2,
  Lock,
  LockOpen,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mapOrderDetail } from "@/context/TransactionContext";
import { orderService } from "@/services/OrderService";
import { courierService } from "@/services/CourierService";
import { recordInvoice, refundEscrow } from "@/lib/blockchain";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatIDR, shortenAddress } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { TrackingTimeline } from "@/components/transaction/TrackingTimeline";

export default function SellerOrderDetailPage({ params }) {
  const { user, hydrated } = useAuth();
  const sellerId = user?.storeId;

  const [tx, setTx] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState("");

  const [couriers, setCouriers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [ship, setShip] = useState({ courierId: "", driverId: "", trackingNumber: "" });
  const [shipping, setShipping] = useState({ location: "", note: "" });
  const [verify, setVerify] = useState(null);

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

  async function run(key, action) {
    setBusy(key);
    try {
      const res = await action();
      if (res && res.status === false) {
        alert(res.message);
        return;
      }
      await loadOrder();
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setBusy("");
    }
  }

  function handleProcess() {
    return run("process", () => orderService.ProcessOrder(sellerId, tx.id));
  }

  function handleReject() {
    const note = window.prompt("Reason for rejecting this order (buyer will be refunded):");
    if (note === null) return;
    return run("reject", async () => {
      // refund escrow ke buyer (onchain) -> catat di backend
      const onchain = await refundEscrow({ orderCode: tx.code, totalIdr: tx.subtotal }, user.walletAddress);
      return orderService.RejectOrder(sellerId, tx.id, { txHash: onchain.txHash, note });
    });
  }

  function handleShip(e) {
    e.preventDefault();
    return run("ship", async () => {
      // 1. generate invoice + hash dari backend
      const invoice = await orderService.GetShippingInvoice(
        sellerId,
        tx.id,
        ship.driverId,
        ship.trackingNumber,
      );
      if (!invoice.status) return invoice;

      // 2. simpan hash invoice ke onchain
      const onchain = await recordInvoice(invoice.invoiceHash, user.walletAddress);

      // 3. tandai order dikirim
      return orderService.ShipOrder(sellerId, tx.id, {
        driverId: ship.driverId,
        trackingNumber: ship.trackingNumber,
        invoiceTxHash: onchain.txHash,
      });
    });
  }

  function handleUpdateShipping(status) {
    return run(status, () =>
      orderService.UpdateShipping(sellerId, tx.id, {
        status,
        location: shipping.location || undefined,
        note: shipping.note || undefined,
      }),
    );
  }

  async function handleVerify() {
    setBusy("verify");
    try {
      const res = await orderService.VerifyInvoice(tx.id, tx.invoiceHash);
      setVerify(res);
    } catch (error) {
      alert(getApiErrorMessage(error));
    } finally {
      setBusy("");
    }
  }

  if (!hydrated || !loaded) return null;

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

  const canReject = tx.status === "paid" || tx.status === "processing";
  const onShipping = ["shipped", "in_transit", "delivered"].includes(tx.status);

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
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Delivery status</h2>
          <div className="mt-4">
            <TrackingTimeline stageIndex={tx.stageIndex} stageTimestamps={tx.stageTimestamps} />
          </div>

          {tx.status === "paid" && (
            <div className="mt-2 rounded-xl border border-seal/30 bg-seal-soft p-4">
              <p className="text-sm font-medium text-seal-dark">New paid order</p>
              <p className="mt-1 text-xs text-ink-soft">
                Payment is held in escrow. Process the items, then hand them to a courier.
              </p>
              <button
                type="button"
                onClick={handleProcess}
                disabled={!!busy}
                className="btn-primary mt-3 w-full"
              >
                {busy === "process" ? <Loader2 size={17} className="animate-spin" /> : <PackageCheck size={17} />}
                Process order
              </button>
            </div>
          )}

          {tx.status === "processing" && (
            <form onSubmit={handleShip} className="mt-2 flex flex-col gap-2.5 rounded-xl border border-seal/30 bg-seal-soft p-4">
              <p className="text-sm font-medium text-seal-dark">Send to shipper</p>
              <p className="text-xs text-ink-soft">
                The shipping invoice is hashed and stored on-chain, so the package content can
                be verified later.
              </p>
              <select
                value={ship.courierId}
                onChange={(e) => setShip((s) => ({ ...s, courierId: e.target.value, driverId: "" }))}
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
                onChange={(e) => setShip((s) => ({ ...s, driverId: e.target.value }))}
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
              <input
                value={ship.trackingNumber}
                onChange={(e) => setShip((s) => ({ ...s, trackingNumber: e.target.value }))}
                placeholder="Tracking number"
                className="input-field"
                required
              />
              <button type="submit" disabled={!!busy} className="btn-primary w-full">
                {busy === "ship" ? <Loader2 size={17} className="animate-spin" /> : <Truck size={17} />}
                Ship &amp; record invoice
              </button>
            </form>
          )}

          {onShipping && tx.status !== "delivered" && (
            <div className="mt-2 flex flex-col gap-2.5 rounded-xl border border-dashed border-border p-4">
              <p className="text-xs font-medium text-ink-soft">Update shipping status</p>
              <input
                value={shipping.location}
                onChange={(e) => setShipping((s) => ({ ...s, location: e.target.value }))}
                placeholder="Current location (optional)"
                className="input-field"
              />
              <input
                value={shipping.note}
                onChange={(e) => setShipping((s) => ({ ...s, note: e.target.value }))}
                placeholder="Note (optional)"
                className="input-field"
              />
              <div className="flex gap-2">
                {tx.status === "shipped" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateShipping("in_transit")}
                    disabled={!!busy}
                    className="btn-secondary flex-1 !py-2 text-xs"
                  >
                    <Navigation size={14} />
                    On the way
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleUpdateShipping("delivered")}
                  disabled={!!busy}
                  className="btn-secondary flex-1 !py-2 text-xs"
                >
                  <MapPin size={14} />
                  Arrived
                </button>
              </div>
            </div>
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
        </section>

        <div className="flex flex-col gap-5">
          <section className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-ink">
              Items ({tx.items.length})
            </h2>
            <div className="mt-3 flex flex-col divide-y divide-border">
              {tx.items.map((item) => (
                <div key={item.orderItemId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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
            <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-medium text-ink">
              <span>Order total</span>
              <span>{formatIDR(tx.subtotal)}</span>
            </div>
            {tx.address && (
              <p className="mt-3 text-xs text-ink-soft">
                Ship to <span className="font-medium text-ink">{tx.address.recipientName}</span> (
                {tx.address.phone}) — {tx.address.fullAddress}, {tx.address.city},{" "}
                {tx.address.province} {tx.address.postalCode}
              </p>
            )}
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
                    ? "Funds locked until buyer confirms"
                    : tx.escrow.refunded
                      ? "Funds refunded to buyer"
                      : "Funds released to your wallet"}
                </p>
                <p className="truncate font-mono text-xs text-ink-faint">
                  {shortenAddress(tx.escrow.locked ? tx.escrow.lockTxHash : tx.escrow.releaseTxHash, 6)}
                </p>
              </div>
            </div>
          </section>

          {tx.invoiceHash && (
            <section className="card p-5 sm:p-6">
              <h2 className="font-display text-base font-semibold text-ink">Shipping invoice</h2>
              <dl className="mt-3 flex flex-col gap-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">Invoice hash</dt>
                  <dd className="font-mono text-ink">{shortenAddress(tx.invoiceHash, 8)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-faint">On-chain tx</dt>
                  <dd className="font-mono text-ink">{shortenAddress(tx.invoiceTxHash, 8)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={handleVerify}
                disabled={!!busy}
                className="btn-secondary mt-3 w-full !py-2 text-xs"
              >
                <FileCheck2 size={14} />
                Verify invoice
              </button>
              {verify && (
                <p className={`mt-2 text-xs ${verify.isMatch ? "text-ledger-dark" : "text-danger"}`}>
                  {verify.message}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
