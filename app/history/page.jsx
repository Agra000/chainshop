"use client";

import { useMemo, useState } from "react";
import { Search, History as HistoryIcon } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { formatIDR } from "@/lib/format";
import { BackButton } from "@/components/ui/BackButton";
import { OrderCard } from "@/components/transaction/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";

export default function HistoryPage() {
  const { completed, hydrated } = useTransactions();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return completed;
    const q = query.trim().toLowerCase();
    return completed.filter(
      (tx) =>
        tx.id.toLowerCase().includes(q) ||
        tx.items.some((it) => it.name.toLowerCase().includes(q))
    );
  }, [completed, query]);

  const totalSpent = useMemo(
    () => completed.reduce((sum, tx) => sum + tx.total, 0),
    [completed]
  );

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-4 mt-1 font-display text-xl font-semibold text-ink">Order History</h1>

      {completed.length === 0 ? (
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
                {formatIDR(totalSpent)}
              </p>
            </div>
          </div>

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
                <OrderCard key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
