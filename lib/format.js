export function formatIDR(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

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

// Simple, believable gas-fee estimate expressed in Rupiah, so the buyer
// never has to think in ETH/GWEI for a purchase this small. This stands
// in for a real network fee estimate once the escrow contract is wired up.
export function estimateGasFeeIDR(subtotal) {
  const base = 2500;
  const variable = Math.round(subtotal * 0.0006);
  const fee = base + variable;
  // round to the nearest 500 so it looks like a real quoted fee
  return Math.max(2500, Math.round(fee / 500) * 500);
}
