"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : "/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-center overflow-hidden rounded-full border border-border bg-paper transition-colors duration-200 focus-within:border-ledger focus-within:bg-surface"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products, brands, or top up..."
        aria-label="Search products"
        className="w-full bg-transparent px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-full items-center gap-1.5 self-stretch bg-ledger px-4 text-white transition-colors duration-200 hover:bg-ledger-dark active:scale-[0.97]"
      >
        <Search size={17} strokeWidth={2.25} />
      </button>
    </form>
  );
}
