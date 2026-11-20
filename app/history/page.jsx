"use client";

import { useMemo, useState } from "react";
import { Search, History as HistoryIcon, Star } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { formatUSDT } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { OrderCard } from "@/components/transaction/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";
import { OrderListPageSkeleton } from "@/components/ui/Skeleton";
import { RateOrderModal } from "@/components/transaction/RateOrderModal";

export default function HistoryPage() {
  const { completed, refunded, cancelled, hydrated } = useTransactions();
  const [query, setQuery] = useState("");
  const [ratingOrder, setRatingOrder] = useState(null);

  // order selesai + order yang di-refund + order yang dibatalkan
  const history = useMemo(
    () =>
      [...completed, ...refunded, ...cancelled].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      ),
    [completed, refunded, cancelled],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return history;
    const q = query.trim().toLowerCase();
    return history.filter(
      (tx) =>
        (tx.code ?? tx.id).toLowerCase().includes(q) ||
        tx.items.some((it) => it.name?.toLowerCase().includes(q))
    );
  }, [history, query]);

  // order completed yang dananya sudah dilepas ke seller dan masih punya barang belum dirating
  const waitingRating = useMemo(() => completed.filter((tx) => tx.needsRating).length, [completed]);

  const totalSpent = useMemo(
    () => completed.reduce((sum, tx) => sum + tx.total, 0),
    [completed]
  );

  if (!hydrated) return <OrderListPageSkeleton withStats />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Order History</h1>

      {history.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon size={26} />}
          title="No completed orders yet"
          description="Orders you've confirmed as received will be archived here."
          actionLabel="Start shopping"
          actionHref="/"
        />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-sm">
            <div className="card px-4 py-3">
              <p className="text-xs text-ink-faint">Orders completed</p>
              <p className="font-display text-lg font-semibold text-ink">{completed.length}</p>
            </div>
            <div className="card px-4 py-3">
              <p className="text-xs text-ink-faint">Total spent</p>
              <p className="font-display text-lg font-semibold text-ink">
                {formatUSDT(totalSpent)}
              </p>
            </div>
          </div>

          {waitingRating > 0 && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-seal/20 bg-seal-soft px-4 py-2.5 text-sm text-seal-dark">
              <Star size={16} className="shrink-0 fill-seal text-seal" />
              <span>
                {waitingRating} completed order{waitingRating > 1 ? "s are" : " is"} waiting for your rating.
              </span>
            </div>
          )}

          <div className="relative mb-4">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by order ID or item name"
              className="input-field pl-10"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-faint">
              No orders match "{query}".
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((tx) => (
                <OrderCard
                  key={tx.id}
                  tx={tx}
                  footer={
                    tx.needsRating && (
                      <div className="flex items-center justify-between gap-3 border-t border-seal/15 bg-seal-soft/60 px-4 py-2.5 sm:px-5">
                        <p className="flex items-center gap-2 text-sm text-ink">
                          <Star size={15} className="shrink-0 fill-seal text-seal" />
                          {tx.unreviewedCount} item{tx.unreviewedCount > 1 ? "s" : ""} in this order waiting for your rating
                        </p>
                        <button
                          type="button"
                          onClick={() => setRatingOrder(tx)}
                          className="btn-primary shrink-0 !px-4 !py-1.5 text-xs"
                        >
                          Rate now
                        </button>
                      </div>
                    )
                  }
                />
              ))}
            </div>
          )}
        </>
      )}

      <RateOrderModal open={!!ratingOrder} order={ratingOrder} onClose={() => setRatingOrder(null)} />
    </div>
  );
}
