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

/**
 * Category list shown in the navbar's bottom row.
 * `slug: "all"` is the default/unfiltered view. `icon` and `color` are
 * cosmetic only (CategoryBar renders every icon at the same size, each
 * tinted with its own `color` so the row reads as distinct departments).
 */
export const categories = [
  { slug: "all", label: "All Products", icon: LayoutGrid, color: "#D32F2F" },
  { slug: "smartphones", label: "Smartphones & Tablets", icon: Smartphone, color: "#2563EB" },
  { slug: "electronics", label: "Electronics", icon: Cpu, color: "#7C3AED" },
  { slug: "fashion", label: "Fashion", icon: Shirt, color: "#DB2777" },
  { slug: "beauty", label: "Beauty & Personal Care", icon: Sparkles, color: "#EC4899" },
  { slug: "home-living", label: "Home & Living", icon: Home, color: "#059669" },
  { slug: "groceries", label: "Daily Needs & Groceries", icon: ShoppingBasket, color: "#16A34A" },
  { slug: "topup", label: "Top Up & Vouchers", icon: Ticket, color: "#EA580C" },
  { slug: "gaming", label: "Gaming", icon: Gamepad2, color: "#4F46E5" },
  { slug: "automotive", label: "Automotive", icon: Car, color: "#0EA5E9" },
  { slug: "sports", label: "Sports & Outdoor", icon: Dumbbell, color: "#F59E0B" },
  { slug: "baby", label: "Mother & Baby", icon: Baby, color: "#F472B6" },
  { slug: "books", label: "Books & Stationery", icon: BookOpen, color: "#8B5CF6" },
];

export function getCategoryLabel(slug) {
  const found = categories.find((c) => c.slug === slug);
  return found ? found.label : "All Products";
}
