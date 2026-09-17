/**
 * Category list shown in the navbar's bottom row.
 * `slug: "all"` is the default/unfiltered view.
 */
export const categories = [
  { slug: "all", label: "All Products" },
  { slug: "smartphones", label: "Smartphones & Tablets" },
  { slug: "electronics", label: "Electronics" },
  { slug: "fashion", label: "Fashion" },
  { slug: "beauty", label: "Beauty & Personal Care" },
  { slug: "home-living", label: "Home & Living" },
  { slug: "groceries", label: "Daily Needs & Groceries" },
  { slug: "topup", label: "Top Up & Vouchers" },
  { slug: "gaming", label: "Gaming" },
  { slug: "automotive", label: "Automotive" },
  { slug: "sports", label: "Sports & Outdoor" },
  { slug: "baby", label: "Mother & Baby" },
  { slug: "books", label: "Books & Stationery" },
];

export function getCategoryLabel(slug) {
  const found = categories.find((c) => c.slug === slug);
  return found ? found.label : "All Products";
}
