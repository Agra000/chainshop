"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // TopNavbar lives in the root layout, so it never unmounts between page
  // navigations — without this, opening the auth modal and then navigating
  // (e.g. via the browser back button) leaves it stuck open on top of
  // whatever page you land on next, blocking it from view (e.g. /cart).
  useEffect(() => {
    setAuthMode(null);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 bg-navbar backdrop-blur">
      {/* top row: brand pinned left, search fills the middle, cart + account
          pinned right — full viewport width, not boxed into a centered column */}
      <div className="flex w-full items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <Logo />
        </div>

        <div className="flex-1">
          <SearchBar />
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden h-6 w-px bg-white/25 sm:block" aria-hidden="true" />

          <Link
            href="/cart"
            aria-label="Open cart"
            className="icon-btn relative shrink-0 !text-white hover:!bg-white/15 hover:!text-white"
          >
            <ShoppingCart size={21} strokeWidth={2} />
            {totalCount > 0 && (
              <span
                key={bump}
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-navbar animate-bump"
              >
                {totalCount > 99 ? "99+" : totalCount}
              </span>
            )}
          </Link>

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className="btn-ghost !text-white hover:!bg-white/15 hover:!text-white"
              >
                Sign up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="btn-secondary !border-white/40 !bg-white/10 !text-white hover:!border-white/60 hover:!bg-white/20"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* mobile-only auth row, since the top row hides text labels below sm */}
      {!isLoggedIn && (
        <div className="flex items-center gap-1.5 border-t border-white/15 px-4 py-2 sm:hidden">
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className="btn-ghost !px-3 text-xs !text-white hover:!bg-white/15 hover:!text-white"
          >
            Sign up
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className="btn-secondary !px-3 !py-1.5 text-xs !border-white/40 !bg-white/10 !text-white hover:!border-white/60 hover:!bg-white/20"
          >
            Log in
          </button>
        </div>
      )}

      {/* bottom row: category menu, floated as a white card straddling the
          red header and the page below it — homepage only, like a typical
          marketplace where the category rail isn't needed on every page */}
      {isHomepage && (
        <div className="relative pt-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="-mb-6 rounded-2xl bg-white p-2.5 shadow-lg shadow-black/10 sm:p-3">
              <Suspense fallback={<CategoryBarFallback />}>
                <CategoryBar />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      <AuthModal open={authMode !== null} mode={authMode} onClose={() => setAuthMode(null)} />
    </header>
  );
}
