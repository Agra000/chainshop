import { categoryService } from "@/services/CategoryService";

/**
 * Category list shown in the navbar's bottom row.
 * `slug: "all"` is the default/unfiltered view. `icon` and `color` are
 * cosmetic only (CategoryBar renders every icon at the same size, each
 * tinted with its own `color` so the row reads as distinct departments).
 */
export const categories = [];

export async function fetchCategories() {
  try {
    const res = await categoryService.GetAllCategory();
    const fetchedData = res.data || [];
    categories.length = 0;
    categories.push({ slug: "all" }, ...fetchedData);
    return categories;
  } catch (err) {
    console.error("Fetch Categories Failed:", err);
    return [];
  }
}

export function getCategoryLabel(slug) {
  const found = categories.find((c) => c.slug === slug);
  return found ? found.label : "All Products";
}
