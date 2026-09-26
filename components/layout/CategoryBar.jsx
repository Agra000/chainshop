"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchCategories } from "@/data/categories";
import { useEffect, useState } from "react"; // 1. Import useState
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  function scrollLeft() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: -Math.min(260, el.clientWidth * 0.8), behavior: "smooth" });
  }

  function scrollRight() {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: Math.min(260, el.clientWidth * 0.8), behavior: "smooth" });
  }

  // 2. Buat state untuk menyimpan data categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchCategories(); // 3. Ambil data hasil return
      setCategories(data); // 4. Masukkan data ke React State
      setLoading(false);
    }

    loadData();
  }, []);

  // Opsional: Tampilkan fallback saat data sedang dimuat
  if (loading) {
    return <CategoryBarFallback />;
  }

  return (
    <nav aria-label="Product categories" className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={scrollLeft}
        aria-label="Scroll categories left"
        tabIndex={canScrollLeft ? 0 : -1}
        aria-hidden={!canScrollLeft}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navbar-soft text-navbar shadow-sm transition-all duration-200 ease-out hover:scale-105 sm:h-8 sm:w-8 ${
          canScrollLeft
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-1 opacity-0"
        }`}
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto scroll-smooth py-1 sm:gap-2"
      >
        {categories.map((cat) => {
          const isActive = cat.slug === activeCategory;
          const Icon = cat.icon;

          if (cat.slug === "all") {
            return (
              <Link
                key={cat.slug}
                href="/"
                className={`flex h-[74px] w-[78px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-navbar px-2 text-center text-white shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03] sm:h-[88px] sm:w-[92px] ${
                  isActive ? "ring-2 ring-navbar-dark ring-offset-2" : ""
                }`}
              >
                {Icon && <Icon size={20} strokeWidth={2} />}
                <span className="text-[11px] font-semibold leading-tight sm:text-[12px]">{cat.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={cat.slug}
              href={`/?category=${cat.slug}`}
              className="flex h-[74px] w-[78px] shrink-0 flex-col items-center justify-start gap-1.5 rounded-xl px-1 py-1.5 text-center transition-colors duration-200 ease-out hover:bg-paper sm:h-[88px] sm:w-[92px]"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-shadow duration-200 sm:h-11 sm:w-11"
                style={{
                  backgroundColor: `${cat.color}1A`,
                  boxShadow: isActive ? `0 0 0 2px ${cat.color}` : "0 0 0 2px transparent",
                }}
              >
                {Icon && <Icon size={18} strokeWidth={2} style={{ color: cat.color }} />}
              </span>
              <span
                className={`line-clamp-2 min-h-[28px] text-[11px] leading-tight sm:min-h-[30px] sm:text-[12px] ${
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
        tabIndex={canScrollRight ? 0 : -1}
        aria-hidden={!canScrollRight}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navbar-soft text-navbar shadow-sm transition-all duration-200 ease-out hover:scale-105 sm:h-8 sm:w-8 ${
          canScrollRight
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-1 opacity-0"
        }`}
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
