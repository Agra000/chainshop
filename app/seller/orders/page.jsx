"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { mapOrderSummary } from "@/context/TransactionContext";
import { orderService } from "@/services/OrderService";
import { BackButton } from "@/components/ui/BackButton";
import { OrderCard } from "@/components/transaction/OrderCard";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";

const FILTERS = [
  { value: "", label: "All" },
  { value: "paid", label: "New" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "in_transit", label: "On the way" },
  { value: "delivered", label: "Arrived" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function SellerOrdersPage() {
  return (
    <Suspense fallback={null}>
      <SellerOrders />
    </Suspense>
  );
}

function SellerOrders() {
  const { user, isSeller, hydrated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!user || (user.storeId !== undefined && !isSeller)) router.replace("/");
  }, [hydrated, user, isSeller, router]);

  useEffect(() => {
    if (!user?.storeId) return;

    async function loadData() {
      setLoading(true);
      try {
        const res = await orderService.GetSellerOrders(user.storeId, status || undefined);
        setOrders((res.data || []).map(mapOrderSummary));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user?.storeId, status]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton fallbackHref="/seller" />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Order List</h1>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`chip shrink-0 border ${
              status === f.value
                ? "border-ledger bg-ledger-soft text-ledger-dark"
                : "border-border text-ink-soft hover:bg-paper"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={26} />}
          title="No orders yet"
          description="Paid orders from buyers will show up here."
          actionLabel="Back to dashboard"
          actionHref="/seller"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((tx) => (
            <OrderCard
              key={tx.id}
              tx={tx}
              href={`/seller/orders/${tx.id}`}
              ctaLabel={tx.buyerName ? `Manage · ${tx.buyerName}` : "Manage order"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
