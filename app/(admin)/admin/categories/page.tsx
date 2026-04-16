import { createClient } from "@/lib/supabase/server";
import { CategoriesClient } from "./categories-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories | Admin" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(id)")
    .order("sort_order")
    .order("name");

  const mapped = (categories ?? []).map((cat) => ({
    ...cat,
    product_count: Array.isArray(cat.products) ? cat.products.length : 0,
    products: undefined,
  }));

  return (
    <div className="space-y-6">
      <h1 className="font-poppins text-2xl font-bold text-gray-900">Categories</h1>
      <CategoriesClient categories={mapped} />
    </div>
  );
}
