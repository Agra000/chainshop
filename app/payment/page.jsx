"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertTriangle, Droplets, Fuel, Info, MapPin, PackageOpen, ShieldCheck, Store, Truck, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTransactions } from "@/context/TransactionContext";
import { addressService } from "@/services/AddressService";
import { orderService } from "@/services/OrderService";
import { getApiErrorMessage } from "@/lib/axios";
import { formatGasEstimate, formatUSDT, shortenAddress } from "@/lib/format";
import { getEthBalance, getMusdtInfo, isOnchainConfigured } from "@/lib/blockchain";
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
  const [step, setStep] = useState("");

  // rincian per seller dari backend (harga barang, ongkir, estimasi gas dari smart contract)
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  // saldo wallet (Sepolia)
  const [wallet, setWallet] = useState(null);

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

  const selectionKey = selectedItems.map((it) => `${it.id}:${it.qty}`).join(",");

  useEffect(() => {
    if (!user?.userId || selectedItems.length === 0) return;
    let cancelled = false;
    setLoadingPreview(true);
    orderService
      .CheckoutPreview(user.userId)
      .then((res) => {
        if (cancelled) return;
        if (res.status) {
          setPreview(res);
          setPreviewError("");
        } else {
          setPreview(null);
          setPreviewError(res.message);
        }
      })
      .catch((error) => !cancelled && setPreviewError(getApiErrorMessage(error, "Failed to calculate the price.")))
      .finally(() => !cancelled && setLoadingPreview(false));
    return () => {
      cancelled = true;
    };
  }, [user?.userId, selectionKey]);

  async function loadWallet() {
    if (!user?.walletAddress || !isOnchainConfigured()) return;
    try {
      const [musdt, eth] = await Promise.all([getMusdtInfo(user.walletAddress), getEthBalance(user.walletAddress)]);
      setWallet({ musdt: musdt.balance, eth });
    } catch (e) {
      setWallet(null);
    }
  }

  useEffect(() => {
    loadWallet();
  }, [user?.walletAddress]);

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

  const groups = preview?.data || [];
  const subtotal = useMemo(() => groups.reduce((s, g) => s + g.itemsTotal, 0), [groups]);
  const shippingFee = useMemo(() => groups.reduce((s, g) => s + g.shippingFee, 0), [groups]);
  const gasFee = preview?.totalGasFee ?? 0;
  const total = preview?.grandTotal ?? 0;
  const insufficient = wallet && wallet.musdt < total;
  const noEth = wallet && wallet.eth <= 0;

  const methodLabel = PAYMENT_METHODS.find((m) => m.id === method)?.label ?? "";

  async function handleConfirm() {
    if (!addressId) {
      toast.warning("Tambahkan alamat pengiriman terlebih dahulu.");
      setModalOpen(false);
      return;
    }

    setProcessing(true);
    try {
      // checkout -> approve mUSDT -> deposit escrow per seller (onchain) -> verifikasi pembayaran di backend
      const tx = await createTransaction({
        items: selectedItems,
        addressId,
        paymentMethod: method,
        onStep: setStep,
      });
      await checkoutSelected();
      setModalOpen(false);
      toast.success("Payment held in escrow on-chain.");
      router.push(tx.orders.length > 1 ? "/transaction" : `/transaction/${tx.id}`);
    } catch (error) {
      await checkoutSelected();
      toast.error(error.message || "Payment failed.");
      setModalOpen(false);
      loadWallet();
    } finally {
      setProcessing(false);
      setStep("");
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

  const canPay = !!addressId && !!preview && !loadingPreview && isOnchainConfigured();

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/cart" />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Payment</h1>

      {!isOnchainConfigured() && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Smart contract escrow belum dikonfigurasi. Isi NEXT_PUBLIC_ESCROW_ADDRESS dan NEXT_PUBLIC_MUSDT_ADDRESS di .env.local.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr] md:items-start">
        {/* left: 1 order escrow per seller */}
        <section className="flex flex-col gap-4">
          {loadingPreview && !preview && <div className="card p-5 text-sm text-ink-faint">Calculating price & gas estimate…</div>}
          {previewError && (
            <div className="card flex items-start gap-2 p-5 text-sm text-danger">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {previewError}
            </div>
          )}

          {groups.map((g) => (
            <div key={g.sellerId} className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
                  <Store size={16} className="text-ink-soft" />
                  {g.shopName}
                </h2>
                <span className="chip bg-paper text-ink-soft">1 escrow · 1 invoice</span>
              </div>
              <div className="mt-3 flex flex-col divide-y divide-border">
                {g.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-paper">
                      {item.image && <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-ink">{item.name}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">
                        {item.qty} × {formatUSDT(item.price)}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold text-ink">{formatUSDT(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
              <dl className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3 text-xs">
                <div className="flex justify-between text-ink-soft">
                  <dt>Items</dt>
                  <dd>{formatUSDT(g.itemsTotal)}</dd>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <dt>Shipping fee</dt>
                  <dd>{formatUSDT(g.shippingFee)}</dd>
                </div>
                <div className="flex justify-between text-signal-dark">
                  <dt>Gas estimate ({g.itemCount} item line{g.itemCount > 1 ? "s" : ""})</dt>
                  <dd>{formatGasEstimate(g.gasFeeEstimate)}</dd>
                </div>
                <div className="flex justify-between pt-1 text-sm font-medium text-ink">
                  <dt>Held in escrow</dt>
                  <dd>{formatUSDT(g.total, { maxDecimals: 4 })}</dd>
                </div>
              </dl>
            </div>
          ))}

          <div className="card p-5 sm:p-6">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
              <MapPin size={15} className="text-ink-soft" />
              Shipping address
            </p>
            {addresses.length > 0 ? (
              <select value={addressId} onChange={(e) => setAddressId(e.target.value)} className="input-field bg-surface">
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
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper/70 px-4 py-3 text-xs text-ink-soft">
              <Truck size={15} className="shrink-0 text-ink-soft" />
              The seller has 3 days to ship. If not, the escrow refunds you automatically.
            </div>
          </div>
        </section>

        {/* right: totals, gas fee, wallet, pay button */}
        <section className="card p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-ink">Price details</h2>
          <dl className="mt-3 flex flex-col gap-2.5 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="text-ink">{formatUSDT(subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-ink-soft">Shipping fee ({groups.length} order{groups.length > 1 ? "s" : ""})</dt>
              <dd className="text-ink">{formatUSDT(shippingFee)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-1.5 text-signal-dark">
                <Fuel size={14} />
                Gas estimate for seller
              </dt>
              <dd className="text-ink">{formatGasEstimate(gasFee)}</dd>
            </div>
            <div className="flex items-start gap-1.5 rounded-lg bg-signal-soft px-3 py-2 text-xs text-signal-dark">
              <Info size={13} className="mt-0.5 shrink-0" />
              <span>
                The gas estimate (±) covers the seller&apos;s two on-chain transactions for your order (recording the
                invoice when shipping, and claiming the payment after you accept). Accepting the order only needs a free
                signature from you, no gas. It is calculated by the smart contract from the number of item lines.{" "}
                <strong>The whole estimate is paid to the seller, including any remaining amount</strong> if the actual
                gas turns out lower. If the order is cancelled before shipping, it is returned to you.
              </span>
            </div>
          </dl>

          <div className="my-4 h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="font-medium text-ink">Total</span>
            <span className="font-display text-xl font-bold text-ink">{formatUSDT(total, { maxDecimals: 4 })}</span>
          </div>
          <p className="mt-1 text-xs text-ink-faint">
            Plus a small amount of Sepolia ETH in MetaMask for the approve & deposit transactions.
          </p>

          <div className="mt-4 rounded-xl border border-border px-4 py-3 text-xs">
            <p className="flex items-center gap-1.5 font-medium text-ink">
              <Wallet size={14} className="text-ink-soft" />
              {user?.walletAddress ? shortenAddress(user.walletAddress) : "MetaMask wallet"}
            </p>
            {wallet ? (
              <p className={`mt-1 ${insufficient || noEth ? "text-danger" : "text-ink-soft"}`}>
                {formatUSDT(wallet.musdt)} · {wallet.eth.toFixed(4)} Sepolia ETH
                {insufficient && " — not enough mUSDT"}
                {noEth && " — no Sepolia ETH for gas"}
              </p>
            ) : (
              <p className="mt-1 text-ink-faint">Balance will be checked when you pay.</p>
            )}
            <Link href="/faucet" className="mt-2 inline-flex items-center gap-1 font-medium text-seal hover:underline">
              <Droplets size={13} />
              Get free test mUSDT
            </Link>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </div>

          <button type="button" onClick={() => setModalOpen(true)} disabled={!canPay} className="btn-primary mt-5 w-full">
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
        orderCount={groups.length}
        paymentMethodLabel={methodLabel}
        processing={processing}
        step={step}
      />
    </div>
  );
}
