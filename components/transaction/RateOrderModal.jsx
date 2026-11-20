"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useTransactions } from "@/context/TransactionContext";
import { getApiErrorMessage } from "@/lib/axios";
import { formatUSDT } from "@/lib/format";
import { toast } from "@/lib/toast";

const MAX_COMMENT = 500;
const STAR_LABELS = ["", "Very bad", "Bad", "Okay", "Good", "Excellent"];

function StarPicker({ value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          className="rounded p-0.5 transition-transform duration-150 hover:scale-110 disabled:hover:scale-100"
        >
          <Star size={22} className={n <= shown ? "fill-seal text-seal" : "text-ink-faint"} />
        </button>
      ))}
      <span className="ml-2 text-xs text-ink-soft">{STAR_LABELS[shown]}</span>
    </div>
  );
}

/**
 * Rating barang dari Order History. Hanya dibuka untuk order completed yang dananya
 * sudah dilepas dari escrow ke seller (backend tetap memvalidasi ulang).
 * Buyer boleh merating sebagian barang dulu; sisanya bisa dirating nanti.
 */
export function RateOrderModal({ open, onClose, order }) {
  const { getTransaction, rateOrder } = useTransactions();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    if (!open || !order?.id) return;
    let cancelled = false;
    setDetail(null);
    setRatings({});
    setComments({});
    setLoading(true);
    getTransaction(order.id)
      .then((data) => !cancelled && setDetail(data))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open, order?.id, getTransaction]);

  const items = detail?.items || [];
  const pending = items.filter((it) => !it.isReviewed);
  const ratedCount = pending.filter((it) => ratings[it.orderItemId]).length;

  async function handleSubmit() {
    const payload = pending
      .filter((it) => ratings[it.orderItemId])
      .map((it) => ({
        orderItemId: it.orderItemId,
        rating: ratings[it.orderItemId],
        comment: comments[it.orderItemId]?.trim() || null,
      }));
    if (payload.length === 0) return;

    setSubmitting(true);
    try {
      const res = await rateOrder(order.id, payload);
      toast.success(res.message || "Thank you for your rating");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit rating."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={submitting ? undefined : onClose} labelledBy="rate-order-title">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-seal-soft text-seal-dark">
        <Star size={22} />
      </div>
      <h2 id="rate-order-title" className="mt-4 font-display text-xl font-semibold text-ink">
        Rate your items
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Order <span className="font-medium text-ink">{order?.code}</span> is complete and the payment was released to the
        seller. Your rating is added to each product&apos;s overall score.
      </p>

      <div className="mt-4 flex max-h-[55vh] flex-col gap-3 overflow-y-auto pr-1">
        {loading && <p className="py-6 text-center text-sm text-ink-faint">Loading items…</p>}

        {!loading && detail && !detail.isReviewable && (
          <p className="rounded-xl bg-paper/70 px-4 py-3 text-sm text-ink-soft">
            This order can&apos;t be rated yet. Ratings open once the order is completed and the payment is released to the
            seller.
          </p>
        )}

        {!loading &&
          detail?.isReviewable &&
          items.map((item) => (
            <div key={item.orderItemId} className="rounded-xl border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-paper">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm text-ink">{item.name}</p>
                  <p className="text-xs text-ink-faint">
                    {item.qty} × {formatUSDT(item.price)}
                  </p>
                </div>
                {item.isReviewed && (
                  <span className="chip bg-ledger-soft text-ledger-dark">
                    <CheckCircle2 size={13} />
                    Rated
                  </span>
                )}
              </div>

              {!item.isReviewed && (
                <div className="mt-3 flex flex-col gap-2">
                  <StarPicker
                    value={ratings[item.orderItemId] || 0}
                    onChange={(n) => setRatings((r) => ({ ...r, [item.orderItemId]: n }))}
                    disabled={submitting}
                  />
                  {ratings[item.orderItemId] > 0 && (
                    <textarea
                      value={comments[item.orderItemId] || ""}
                      onChange={(e) =>
                        setComments((c) => ({ ...c, [item.orderItemId]: e.target.value.slice(0, MAX_COMMENT) }))
                      }
                      disabled={submitting}
                      rows={2}
                      placeholder="Tell other buyers about this item (optional)"
                      className="input-field resize-none"
                    />
                  )}
                </div>
              )}
            </div>
          ))}

        {!loading && !detail && open && (
          <p className="py-6 text-center text-sm text-ink-faint">Couldn&apos;t load this order. Please try again.</p>
        )}
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" onClick={onClose} disabled={submitting} className="btn-secondary flex-1">
          Later
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || ratedCount === 0}
          className="btn-primary flex-1"
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Submitting...
            </>
          ) : ratedCount > 1 ? (
            `Submit ${ratedCount} ratings`
          ) : (
            "Submit rating"
          )}
        </button>
      </div>
    </Modal>
  );
}
