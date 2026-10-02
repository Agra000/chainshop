import { categoryService } from "@/services/CategoryService";
import { LayoutGrid } from "lucide-react";

export const categories = [];

export async function fetchCategories() {
  try {
    const res = await categoryService.GetAllCategory();
    const fetchedData = res.data || [];
    categories.length = 0;
    categories.push({ slug: "all", icon: LayoutGrid }, ...fetchedData);
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
