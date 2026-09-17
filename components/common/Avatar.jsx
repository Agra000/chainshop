const PALETTE = ["#C1651C", "#1F6F63", "#4B4FDB", "#9C5015", "#175750"];

export function initialsOf(name) {
  return (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function colorFromString(str) {
  let hash = 0;
  const s = str || "CS";
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ name, seed, size = 40, className = "" }) {
  const bg = colorFromString(seed || name);
  const px = `${size}px`;
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{ backgroundColor: bg, width: px, height: px, fontSize: size * 0.38 }}
    >
      {initialsOf(name) || "CS"}
    </span>
  );
}
