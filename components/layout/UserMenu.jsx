"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User, PackageSearch, History, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/common/Avatar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!user) return null;

  const menuItems = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/transaction", label: "Transactions", icon: PackageSearch },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors duration-200 hover:bg-paper"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} seed={user.walletAddress} size={32} />
        <span className="hidden max-w-[110px] truncate text-sm font-medium text-ink sm:inline">
          {user.name}
        </span>
        <ChevronDown
          size={15}
          className={`hidden text-ink-soft transition-transform duration-200 sm:inline ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-40 w-52 animate-pop-in overflow-hidden rounded-2xl border border-border bg-surface py-1.5 shadow-lg shadow-ink/5"
        >
          <div className="border-b border-border px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">
              {user.email || "Wallet account"}
            </p>
          </div>
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink transition-colors duration-150 hover:bg-paper"
            >
              <Icon size={16} className="text-ink-soft" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
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
  );
}
