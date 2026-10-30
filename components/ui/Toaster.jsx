"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { TOAST_EVENT } from "@/lib/toast";

const MAX_TOASTS = 4;
const EXIT_MS = 200;

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    title: "Success",
    iconWrap: "bg-ledger-soft text-ledger",
    bar: "bg-ledger",
  },
  error: {
    icon: XCircle,
    title: "Something Happened !",
    iconWrap: "bg-danger-soft text-danger",
    bar: "bg-danger",
  },
  warning: {
    icon: AlertTriangle,
    title: "Alert !",
    iconWrap: "bg-amber-100 text-amber-600",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    title: "Info",
    iconWrap: "bg-signal-soft text-signal",
    bar: "bg-signal",
  },
};

function ToastItem({ toast, onDismiss }) {
  const variant = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = variant.icon;
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);

  // sisa waktu tampil, dikurangi selama tidak di-hover
  const remaining = useRef(toast.duration);
  const startedAt = useRef(Date.now());

  const close = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => onDismiss(toast.id), EXIT_MS);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    if (paused || leaving) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(close, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, leaving, close]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-lg shadow-ink/10 backdrop-blur ${
        leaving ? "animate-toast-out" : "animate-toast-in"
      }`}
    >
      <div className="flex items-start gap-3 p-3.5 pr-10">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${variant.iconWrap}`}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold text-ink">
            {toast.title ?? variant.title}
          </p>
          <p className="mt-0.5 break-words text-sm text-ink-soft">
            {toast.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={close}
        aria-label="Tutup notifikasi"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-ink-faint transition-colors duration-150 hover:bg-paper hover:text-ink"
      >
        <X size={15} />
      </button>

      {/* progress bar: menunjukkan sisa waktu sebelum toast menghilang */}
      <span
        aria-hidden="true"
        className={`absolute bottom-0 left-0 h-[3px] w-full origin-left ${variant.bar} opacity-70`}
        style={{
          animation: `toast-progress ${toast.duration}ms linear forwards`,
          animationPlayState: paused ? "paused" : "running",
        }}
      />
    </div>
  );
}

// toast selalu di atas semua modal (Modal / DeleteStoreModal memakai z-[100])
const TOAST_Z_INDEX = 99999;

export function Toaster() {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handle(e) {
      const next = e.detail;
      setToasts((prev) => {
        // pesan identik yang masih tampil tidak perlu ditumpuk
        if (
          prev.some((t) => t.message === next.message && t.type === next.type)
        ) {
          return prev;
        }
        return [...prev, next].slice(-MAX_TOASTS);
      });
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => window.removeEventListener(TOAST_EVENT, handle);
  }, []);

  if (!mounted) return null;

  // portal ke <body> (setelah modal) supaya tidak terjebak stacking context parent
  return createPortal(
    <div
      aria-live="polite"
      style={{ zIndex: TOAST_Z_INDEX }}
      className="pointer-events-none fixed inset-x-0 top-3 flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[360px] sm:items-stretch sm:px-0"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>,
    document.body,
  );
}
