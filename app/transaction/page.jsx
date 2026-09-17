"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { useTransactions } from "@/context/TransactionContext";
import { BackButton } from "@/components/ui/BackButton";
import { OrderCard } from "@/components/transaction/OrderCard";
import { EmptyState } from "@/components/common/EmptyState";

export default function TransactionListPage() {
  const { ongoing, completed, hydrated } = useTransactions();

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="mb-4 mt-1 flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold text-ink">My Transactions</h1>
        {completed.length > 0 && (
          <Link href="/history" className="text-sm font-medium text-seal hover:underline">
            View order history
          </Link>
        )}
      </div>

      {ongoing.length === 0 ? (
        <EmptyState
          icon={<PackageSearch size={26} />}
          title="No ongoing orders"
          description="Orders you pay for will show up here with live delivery tracking."
          actionLabel="Start shopping"
          actionHref="/"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ongoing.map((tx) => (
            <OrderCard key={tx.id} tx={tx} ctaLabel="Track order" />
          ))}
        </div>
      )}
    </div>
  );
}
