"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Scale } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { refundService } from "@/services/RefundService";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatUSDT } from "@/lib/format";
import { toIsoDate } from "@/context/TransactionContext";
import { BackButton } from "@/components/ui/BackButton";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "refunded", label: "Refunded" },
  { value: "expired", label: "Expired" },
  { value: "", label: "All" },
];

const STATUS_STYLE = {
  pending: "bg-signal-soft text-signal-dark",
  approved: "bg-ledger-soft text-ledger-dark",
  refunded: "bg-ledger-soft text-ledger-dark",
  rejected: "bg-danger-soft text-danger",
  expired: "bg-paper text-ink-soft",
};

export default function AdminRefundsPage() {
  const { user, hydrated } = useAuth();
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated || !user?.userId) return;
    setLoading(true);
    refundService
      .AdminList(user.userId, status)
      .then((res) => setRows(res.data || []))
      .catch((error) => toast.error(getApiErrorMessage(error, "Failed to load refund requests.")))
      .finally(() => setLoading(false));
  }, [hydrated, user?.userId, status]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
      <BackButton />
      <h1 className="mb-1 mt-1 flex items-center gap-2 font-display text-xl font-semibold text-ink">
        <Scale size={20} className="text-ink-soft" />
        Refund Arbitration
      </h1>
      <p className="mb-4 text-sm text-ink-soft">
        Review buyer refund requests. Decisions are executed on-chain with your admin wallet (ADMIN_ROLE in the escrow
        contract).
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`chip border ${status === f.value ? "border-ink bg-ink text-white" : "border-border bg-surface text-ink-soft"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Scale size={26} />} title="No refund requests" description="Nothing to review in this tab." />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((r) => (
            <Link
              key={r.id}
              href={`/admin/refunds/${r.id}`}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">{r.orderCode}</p>
                  <p className="text-xs text-ink-faint">
                    {r.buyerName} → {r.shopName} · attempt #{r.attempt}
                    {r.notDelivered ? " · not delivered" : ""}
                  </p>
                </div>
                <span className={`chip ${STATUS_STYLE[r.status] || "bg-paper text-ink-soft"}`}>{r.status}</span>
              </div>
              <p className="line-clamp-2 text-xs text-ink-soft">{r.reason}</p>
              <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-ink-faint">{formatDate(toIsoDate(r.createdAt))}</span>
                <span className="flex items-center gap-1 font-medium text-seal">
                  Refund {formatUSDT(r.refundAmount)}
                  <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
