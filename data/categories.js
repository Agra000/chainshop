import { categoryService } from "@/services/CategoryService";
import { LayoutGrid } from "lucide-react";

export const categories = [];

export async function fetchCategories() {
  try {
    const res = await categoryService.GetAllCategory();
    const fetchedData = (res.data || []).map((c) => ({ ...c, label: c.name }));
    categories.length = 0;
    categories.push({ slug: "all", label: "All Products", icon: LayoutGrid }, ...fetchedData);
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

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug) || null;
}

export function getCategoryByName(name) {
  return categories.find((c) => c.name === name) || null;
}
