import { Star } from "lucide-react";

export function RatingStars({ rating = 0, size = 13, showValue = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Star size={size} className="fill-seal text-seal" />
      {showValue && (
        <span className="text-xs font-medium text-ink-soft">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}
