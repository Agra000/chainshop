// Semua nominal memakai Mock USDT (mUSDT) di Sepolia testnet — bukan uang asli.
export function formatUSDT(amount, { maxDecimals = 2 } = {}) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.max(2, maxDecimals),
  }).format(Number(amount) || 0)} mUSDT`;
}

// estimasi gas ditampilkan dengan tanda ± karena gas aktual baru diketahui setelah transaksi
export function formatGasEstimate(amount) {
  return `± ${formatUSDT(amount, { maxDecimals: 4 })}`;
}

// sisa waktu sampai deadline, mis. "2d 4h" / "35m" / "expired"
export function formatCountdown(deadline, now = Date.now()) {
  if (!deadline) return "-";
  const target = typeof deadline === "number" ? deadline : new Date(deadline).getTime();
  if (Number.isNaN(target)) return "-";
  let diff = Math.floor((target - now) / 1000);
  if (diff <= 0) return "expired";
  const d = Math.floor(diff / 86400);
  diff -= d * 86400;
  const h = Math.floor(diff / 3600);
  diff -= h * 3600;
  const m = Math.floor(diff / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${Math.max(1, m)}m`;
}

export function formatDate(date) {
  if (!date) return "-";
  // backend mengirim "yyyy-MM-dd HH:mm:ss" (UTC)
  const d =
    typeof date === "string"
      ? new Date(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(date) ? `${date.replace(" ", "T")}Z` : date)
      : date;
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function isValidWalletAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test((address || "").trim());
}

export function shortenAddress(address, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// Deterministic-looking fake wallet address, purely for demo display.
export function generateWalletAddress() {
  const hex = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(Math.random() * hex.length)];
  }
  return addr;
}

// Deterministic-looking fake transaction hash, purely for demo display.
export function generateTxHash() {
  const hex = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += hex[Math.floor(Math.random() * hex.length)];
  }
  return hash;
}

export function generateOrderId() {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CS-${now}-${rand}`;
}
