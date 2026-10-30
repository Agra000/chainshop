"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatCountdown, formatDate } from "@/lib/format";

// sisa waktu sampai batas (deadline dari smart contract), update tiap 30 detik
export function Countdown({ deadline, label, className = "" }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!deadline) return null;
  const left = formatCountdown(deadline, now);
  const expired = left === "expired";

  return (
    <p className={`flex items-center gap-1.5 text-xs ${expired ? "text-danger" : "text-ink-soft"} ${className}`}>
      <Clock size={13} className="shrink-0" />
      <span>
        {label}: <span className="font-medium">{expired ? "deadline passed" : `${left} left`}</span>{" "}
        <span className="text-ink-faint">({formatDate(deadline)})</span>
      </span>
    </p>
  );
}

export function isPast(deadline) {
  return !!deadline && new Date(deadline).getTime() <= Date.now();
}
