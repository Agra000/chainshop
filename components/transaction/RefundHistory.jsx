import { formatDate } from "@/lib/format";
import { TxLink } from "@/components/common/TxLink";

const STATUS_STYLE = {
  pending: "bg-signal-soft text-signal-dark",
  approved: "bg-ledger-soft text-ledger-dark",
  refunded: "bg-ledger-soft text-ledger-dark",
  rejected: "bg-danger-soft text-danger",
  expired: "bg-paper text-ink-soft",
};

const STATUS_TEXT = {
  pending: "Waiting for admin",
  approved: "Approved",
  refunded: "Refunded",
  rejected: "Rejected",
  expired: "Expired (return not shipped)",
};

export function RefundHistory({ refunds, max = 3 }) {
  if (!refunds?.length) return null;
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-display text-base font-semibold text-ink">
        Refund requests ({refunds.length}/{max})
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {refunds.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-ink">
                Attempt #{r.attempt}
                {r.notDelivered && <span className="ml-1 text-ink-faint">· package not delivered</span>}
              </p>
              <span className={`chip ${STATUS_STYLE[r.status] || "bg-paper text-ink-soft"}`}>
                {STATUS_TEXT[r.status] || r.status}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-ink-soft">{r.reason}</p>
            {r.photoUrl && (
              <a href={r.photoUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-seal hover:underline">
                View photo evidence
              </a>
            )}
            {r.adminNote && <p className="mt-1.5 text-ink">Admin: {r.adminNote}</p>}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-ink-faint">
              <span>{formatDate(r.createdAt)}</span>
              {r.requestTxHash && (
                <span>
                  Request tx <TxLink hash={r.requestTxHash} chars={4} />
                </span>
              )}
              {r.decisionTxHash && (
                <span>
                  Refund tx <TxLink hash={r.decisionTxHash} chars={4} />
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
