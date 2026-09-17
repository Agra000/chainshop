import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { formatDate, formatIDR } from "@/lib/format";
import { ORDER_STAGES } from "@/context/TransactionContext";

const STATUS_STYLE = {
  0: "bg-seal-soft text-seal-dark",
  1: "bg-seal-soft text-seal-dark",
  2: "bg-signal-soft text-signal-dark",
  3: "bg-signal-soft text-signal-dark",
  4: "bg-ledger-soft text-ledger-dark",
  5: "bg-ledger-soft text-ledger-dark",
};

export function OrderCard({ tx, ctaLabel = "View details" }) {
  const visibleThumbs = tx.items.slice(0, 3);
  const extraCount = tx.items.length - visibleThumbs.length;
  const statusLabel = ORDER_STAGES[tx.stageIndex];

  return (
    <Link
      href={`/transaction/${tx.id}`}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ink/10 hover:shadow-md sm:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-ink-faint">{tx.id}</p>
          <p className="text-xs text-ink-faint">{formatDate(tx.createdAt)}</p>
        </div>
        <span className={`chip ${STATUS_STYLE[tx.stageIndex]}`}>{statusLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        {visibleThumbs.map((item, i) => (
          <div key={i} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
            {item.image && (
              <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-paper text-xs font-medium text-ink-soft">
            +{extraCount}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-xs text-ink-faint">Total payment</p>
          <p className="font-display text-base font-semibold text-ink">{formatIDR(tx.total)}</p>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-seal">
          {ctaLabel}
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
}
