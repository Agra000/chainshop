import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }) {
  return (
    <Link
      href="/"
      className={`group flex shrink-0 items-center gap-2 ${className}`}
      aria-label="ChainShop home"
    >
      <Image
        src="/logo.png"
        alt=""
        width={30}
        height={30}
        className="transition-transform duration-300 ease-out group-hover:scale-105"
        aria-hidden="true"
      />
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Chain<span className="text-white/85">Shop</span>
      </span>
    </Link>
  );
}
