"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Modal({ open, onClose, children, labelledBy }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  if (!mounted) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 bg-ink/40 backdrop-blur-[2px] cursor-pointer"
      />
      <div className="grid min-h-full place-items-center p-4">
        <div className="relative z-10 w-full max-w-md animate-pop-in rounded-2xl bg-surface p-6 shadow-xl text-left">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="icon-btn absolute right-3 top-3"
          >
            <X size={18} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
