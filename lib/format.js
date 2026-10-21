export function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
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

// Demo wallet starts with this much USDT until a real wallet is wired up.
export const DEMO_STABLECOIN_BALANCE = 150;

export function formatUSDT(amount) {
  return `${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)} USDT`;
}

// Simple, believable gas-fee estimate in USDT. Stands in for a real network
// fee estimate once the escrow contract is wired up.
export function estimateGasFee(subtotal) {
  const fee = 0.15 + subtotal * 0.0006;
  return Math.max(0.15, Math.round(fee * 100) / 100);
}
