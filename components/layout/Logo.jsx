import Link from "next/link";

export function Logo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`group flex shrink-0 items-center gap-2 ${className}`}
      aria-label="ChainShop home"
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="8"
          width="14"
          height="14"
          rx="6"
          transform="rotate(-12 3 8)"
          fill="#1F6F63"
        />
        <rect
          x="12"
          y="10"
          width="14"
          height="14"
          rx="6"
          transform="rotate(-12 12 10)"
          fill="#C1651C"
          className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        />
      </svg>
      <span className="font-display text-lg font-bold tracking-tight text-ink">
        Chain<span className="text-seal">Shop</span>
      </span>
    </Link>
  );
}
