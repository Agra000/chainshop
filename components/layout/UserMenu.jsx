"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  User,
  PackageSearch,
  History,
  LogOut,
  Store,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/common/Avatar";
import { SellerRegistrationModal } from "@/components/seller/SellerRegistrationModal";

export function UserMenu() {
  const { user, isSeller, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const coreMenuItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/transaction", label: "Transactions", icon: PackageSearch },
    { href: "/history", label: "History", icon: History },
  ];

  function close() {
    setOpen(false);
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors duration-200 hover:bg-white/15"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Avatar name={user.name} seed={user.walletAddress} size={32} />
          <span className="hidden max-w-[110px] truncate text-sm font-medium text-white sm:inline">
            {user.name}
          </span>
          <ChevronDown
            size={15}
            className={`hidden text-white/80 transition-transform duration-200 sm:inline ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-40 w-56 animate-pop-in overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-lg shadow-ink/5"
          >
            {/* ── Header: user name + email ── */}
            <div className="border-b border-border px-3.5 py-2.5">
              <p className="truncate text-sm font-semibold text-ink">
                {user.name}
              </p>
              <p className="truncate text-xs text-ink-faint">
                {user.email || "Wallet account"}
              </p>
            </div>

            {/* ── Seller section (shown when registered) ── */}
            {isSeller && (
              <>
                <div className="px-3.5 pb-1 pt-2">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-ink-faint">
                    My Shop
                  </p>
                  <Link
                    href="/seller"
                    role="menuitem"
                    onClick={close}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-paper"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-seal-soft">
                      <Store size={14} className="text-seal-dark" />
                    </div>
                    <span className="truncate">{user.shop.shopName}</span>
                  </Link>
                </div>
                <div className="mx-3.5 my-1.5 h-px bg-border" />
              </>
            )}

            {/* ── Core buyer menu ── */}
            {coreMenuItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={close}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink transition-colors duration-150 hover:bg-paper"
              >
                <Icon size={16} className="text-ink-soft" />
                {label}
              </Link>
            ))}

            {/* ── Join Seller (shown when NOT yet a seller) ── */}
            {!isSeller && (
              <>
                <div className="mx-3.5 my-1.5 h-px bg-border" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close();
                    setSellerModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium text-seal transition-colors duration-150 hover:bg-seal-soft"
                >
                  <UserPlus size={16} />
                  Join as Seller
                </button>
              </>
            )}

            {/* ── Logout ── */}
            <div className="mx-3.5 my-1.5 h-px bg-border" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                close();
                logout();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger transition-colors duration-150 hover:bg-danger-soft"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Seller registration modal — rendered outside the dropdown so it
          doesn't get clipped by any overflow:hidden ancestor. */}
      <SellerRegistrationModal
        open={sellerModalOpen}
        onClose={() => setSellerModalOpen(false)}
      />
    </>
  );
}
