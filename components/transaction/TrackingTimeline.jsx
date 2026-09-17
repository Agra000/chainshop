import { Package, Warehouse, Truck, Navigation, MapPin, CheckCircle2 } from "lucide-react";
import { ORDER_STAGES } from "@/context/TransactionContext";
import { formatDate } from "@/lib/format";

const STAGE_ICONS = [Package, Warehouse, Truck, Navigation, MapPin, CheckCircle2];

export function TrackingTimeline({ stageIndex, stageTimestamps }) {
  return (
    <ol className="flex flex-col">
      {ORDER_STAGES.map((label, i) => {
        const Icon = STAGE_ICONS[i];
        const reached = i <= stageIndex;
        const isCurrent = i === stageIndex;
        const isLast = i === ORDER_STAGES.length - 1;
        const timestamp = stageTimestamps?.[i];

        return (
          <li key={label} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${
                  i < stageIndex ? "bg-ledger" : "bg-border"
                }`}
              />
            )}
            <span
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                reached
                  ? "border-ledger bg-ledger text-white"
                  : "border-border bg-surface text-ink-faint"
              } ${isCurrent ? "animate-pulse-ring" : ""}`}
            >
              <Icon size={17} />
            </span>
            <div className="pt-1.5">
              <p className={`text-sm font-medium ${reached ? "text-ink" : "text-ink-faint"}`}>
                {label}
              </p>
              <p className="mt-0.5 text-xs text-ink-faint">
                {timestamp ? formatDate(timestamp) : isCurrent ? "In progress" : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
