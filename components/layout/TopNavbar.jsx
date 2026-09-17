"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { CategoryBar, CategoryBarFallback } from "./CategoryBar";
import { UserMenu } from "./UserMenu";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function TopNavbar() {
  const { isLoggedIn } = useAuth();
  const { totalCount, bump } = useCart();
  const [authMode, setAuthMode] = useState(null); // "signup" | "login" | null

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      {/* top row: brand + auth (left) / search (center) / cart (right) */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Logo />
          <span className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button type="button" onClick={() => setAuthMode("signup")} className="btn-ghost">
                Sign up
              </button>
              <button type="button" onClick={() => setAuthMode("login")} className="btn-secondary">
                Log in
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          <SearchBar />
        </div>

        <Link
          href="/cart"
          aria-label="Open cart"
          className="icon-btn relative shrink-0 !text-ink hover:!text-seal"
        >
          <ShoppingCart size={21} strokeWidth={2} />
          {totalCount > 0 && (
            <span
              key={bump}
              className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-seal px-1 text-[11px] font-semibold text-white animate-bump"
            >
              {totalCount > 99 ? "99+" : totalCount}
            </span>
          )}
        </Link>
      </div>

      {/* mobile-only auth row, since the top row hides text labels below sm */}
      {!isLoggedIn && (
        <div className="flex items-center gap-1.5 border-t border-border px-4 py-2 sm:hidden">
          <button type="button" onClick={() => setAuthMode("signup")} className="btn-ghost !px-3 text-xs">
            Sign up
          </button>
          <button type="button" onClick={() => setAuthMode("login")} className="btn-secondary !px-3 !py-1.5 text-xs">
            Log in
          </button>
        </div>
      )}

      {/* bottom row: category menu */}
      <div className="border-t border-border bg-paper/60">
        <Suspense fallback={<CategoryBarFallback />}>
          <CategoryBar />
        </Suspense>
      </div>

      <AuthModal open={authMode !== null} mode={authMode} onClose={() => setAuthMode(null)} />
    </header>
  );
}
