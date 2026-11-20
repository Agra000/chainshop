// Dot kecil berisi angka (gaya sama dengan badge cart di navbar).
// variant "red"  -> di atas latar terang (dropdown, kartu)
// variant "white" -> di atas navbar merah (seperti badge cart)
export function CountBadge({ count, variant = "red", className = "", label }) {
  if (!count || count <= 0) return null;
  const tone =
    variant === "white"
      ? "bg-white text-navbar"
      : "bg-seal text-white ring-2 ring-surface";
  return (
    <span
      aria-label={label ?? `${count} new`}
      className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-none animate-bump ${tone} ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
