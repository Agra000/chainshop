"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { categories } from "@/data/categories";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  return (
    <nav
      aria-label="Product categories"
      className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 lg:px-8"
    >
      {categories.map((cat) => {
        const isActive = cat.slug === activeCategory;
        return (
          <Link
            key={cat.slug}
            href={cat.slug === "all" ? "/" : `/?category=${cat.slug}`}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ease-out ${
              isActive
                ? "border-ledger bg-ledger text-white"
                : "border-transparent bg-transparent text-ink-soft hover:bg-surface hover:text-ink"
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function CategoryBarFallback() {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 sm:px-6 lg:px-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-surface/70"
        />
      ))}
    </div>
  );
}
