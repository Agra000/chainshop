"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * A consistent "back" affordance for every page that isn't the home feed.
 * Falls back to the marketplace home if there's no in-app history to
 * return to (e.g. someone opened the link directly).
 */
export function BackButton({ label = "Back", fallbackHref = "/", className = "" }) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn-ghost -ml-2 !px-3 ${className}`}
    >
      <ArrowLeft size={18} strokeWidth={2.25} />
      <span>{label}</span>
    </button>
  );
}
