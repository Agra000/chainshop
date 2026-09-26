"use client";

import { useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/categories";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const scrollerRef = useRef(null);

  function scrollRight() {
    scrollerRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  }

  return (
    <nav aria-label="Product categories" className="flex items-center gap-1.5">
      <div
        ref={scrollerRef}
        className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth py-1"
      >
        {categories.map((cat) => {
          const isActive = cat.slug === activeCategory;
          const Icon = cat.icon;

          if (cat.slug === "all") {
            return (
              <Link
                key={cat.slug}
                href="/"
                className={`flex h-[74px] w-[92px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-navbar px-2 text-center text-white shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03] ${
                  isActive ? "ring-2 ring-navbar-dark ring-offset-2" : ""
                }`}
              >
                {Icon && <Icon size={20} strokeWidth={2} />}
                <span className="text-[12px] font-semibold leading-tight">{cat.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={cat.slug}
              href={`/?category=${cat.slug}`}
              className="flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-1 py-1.5 text-center transition-colors duration-200 ease-out hover:bg-paper"
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full transition-shadow duration-200"
                style={{
                  backgroundColor: `${cat.color}1A`,
                  boxShadow: isActive ? `0 0 0 2px ${cat.color}` : "0 0 0 2px transparent",
                }}
              >
                {Icon && <Icon size={18} strokeWidth={2} style={{ color: cat.color }} />}
              </span>
              <span
                className={`text-[12px] leading-tight ${
                  isActive ? "font-semibold text-ink" : "font-medium text-ink-soft"
                }`}
              >
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={scrollRight}
        aria-label="Scroll categories right"
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navbar-soft text-navbar shadow-sm transition-transform duration-150 hover:scale-105 sm:flex"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export function CategoryBarFallback() {
  return (
    <div className="flex items-center gap-2 py-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-[74px] w-20 shrink-0 animate-pulse rounded-2xl bg-paper" />
      ))}
    </div>
  );
}
