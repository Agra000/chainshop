"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchCategories } from "@/data/categories";
// import { useEffect, useState } from "react"; // 1. Import useState
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  LayoutGrid,
  Smartphone,
  Cpu,
  Shirt,
  Sparkles,
  Home,
  ShoppingBasket,
  Ticket,
  Gamepad2,
  Car,
  Dumbbell,
  Baby,
  BookOpen,
} from "lucide-react";

export const categoryIconMap = {
  all: LayoutGrid,
  smartphone: Smartphone,
  electronics: Cpu,
  fashion: Shirt,
  beauty: Sparkles,
  home: Home,
  groceries: ShoppingBasket,
  ticket: Ticket,
  gaming: Gamepad2,
  automotive: Car,
  sports: Dumbbell,
  baby: Baby,
  books: BookOpen,
};

export function CategoryBar() {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";
  const scrollerRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [dragging, setDragging] = useState(false);

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

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  // Dipasang SETELAH kategori selesai dimuat: saat loading, scroller belum ada di DOM
  // (sebelumnya listener tidak pernah terpasang, jadi tombol panah tidak pernah muncul).
  useEffect(() => {
    const el = scrollerRef.current;
    if (loading || !el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    // lebar kartu/kategori bisa berubah tanpa event resize window (font, gambar, layout)
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    observer?.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer?.disconnect();
    };
  }, [loading, categories.length, updateScrollState]);

  function scrollByPage(direction) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.max(160, el.clientWidth * 0.7),
      behavior: "smooth",
    });
  }

  // Geser dengan mouse (klik + tarik) di desktop. Di HP/tablet geser jari sudah ditangani browser.
  function onPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = scrollerRef.current;
    dragRef.current = { active: true, moved: false, startX: e.clientX, startScroll: el.scrollLeft };
  }

  function onPointerMove(e) {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) < 5) return; // klik biasa, bukan tarikan
    if (!drag.moved) {
      drag.moved = true;
      setDragging(true);
      scrollerRef.current.setPointerCapture?.(e.pointerId);
    }
    scrollerRef.current.scrollLeft = drag.startScroll - dx;
  }

  function endDrag(e) {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.moved) scrollerRef.current.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  }

  // setelah menarik, jangan anggap sebagai klik pada kategori
  function onClickCapture(e) {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  }

  // Opsional: Tampilkan fallback saat data sedang dimuat
  if (loading) {
    return <CategoryBarFallback />;
  }

  const arrowClass =
    "absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-navbar shadow-md transition-all duration-200 ease-out hover:bg-navbar-soft active:scale-95 sm:h-9 sm:w-9";

  return (
    <nav aria-label="Product categories" className="relative w-full min-w-0">
      {/* bayangan tepi: tanda masih ada kategori di sisi itu */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-white to-transparent transition-opacity duration-200 sm:w-14 ${
          canScrollLeft ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-white to-transparent transition-opacity duration-200 sm:w-14 ${
          canScrollRight ? "opacity-100" : "opacity-0"
        }`}
      />

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        aria-label="Scroll categories left"
        tabIndex={canScrollLeft ? 0 : -1}
        aria-hidden={!canScrollLeft}
        className={`${arrowClass} left-0 ${canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronLeft size={16} />
      </button>

      <div
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={`no-scrollbar flex min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain py-1 select-none sm:gap-2 ${
          canScrollLeft || canScrollRight ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
      >
        {categories.map((cat) => {
          const isActive = cat.slug === activeCategory;
          const Icon = categoryIconMap[cat.slug] || LayoutGrid;
          const href = cat.slug === "all" ? "/" : `/?category=${cat.slug}`;

          // kategori aktif (termasuk "all") memakai tile merah; yang tidak aktif memakai ikon bulat
          if (isActive) {
            return (
              <Link
                key={cat.slug}
                href={href}
                aria-current="page"
                draggable={false}
                className="flex h-[66px] w-[66px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-navbar px-1.5 text-center text-white shadow-sm transition-transform duration-200 ease-out hover:scale-[1.03] sm:h-[88px] sm:w-[92px] sm:px-2"
              >
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2} />
                <span className="line-clamp-2 text-[10px] font-semibold leading-tight sm:text-[12px]">
                  {cat.slug}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={cat.slug}
              href={href}
              draggable={false}
              className="group flex h-[66px] w-[66px] shrink-0 flex-col items-center justify-start gap-1 rounded-xl px-0.5 py-1 text-center transition-colors duration-200 ease-out hover:bg-paper sm:h-[88px] sm:w-[92px] sm:gap-1.5 sm:px-1 sm:py-1.5"
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 sm:h-11 sm:w-11 ${
                  cat.color ? "" : "bg-paper text-ink-soft group-hover:bg-navbar-soft group-hover:text-navbar"
                }`}
                style={cat.color ? { backgroundColor: `${cat.color}1A` } : undefined}
              >
                <Icon
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                  strokeWidth={2}
                  style={cat.color ? { color: cat.color } : undefined}
                />
              </span>
              <span className="line-clamp-2 min-h-[24px] text-[10px] font-medium leading-tight text-ink-soft sm:min-h-[30px] sm:text-[12px]">
                {cat.slug}
              </span>
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(1)}
        aria-label="Scroll categories right"
        tabIndex={canScrollRight ? 0 : -1}
        aria-hidden={!canScrollRight}
        className={`${arrowClass} right-0 ${canScrollRight ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

export function CategoryBarFallback() {
  return (
    <div role="status" aria-label="Loading categories" className="flex items-center gap-2 overflow-hidden py-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="skeleton flex h-[66px] w-[66px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl !bg-paper sm:h-[88px] sm:w-[92px]"
        >
          <span className="h-7 w-7 rounded-full bg-border" />
          <span className="h-2.5 w-12 rounded bg-border" />
        </div>
      ))}
    </div>
  );
}
