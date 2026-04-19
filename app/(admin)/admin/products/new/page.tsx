import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Product | Admin" };

export default async function NewProductPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="font-poppins text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      <ProductForm categories={categories ?? []} />
    </div>
  );
}
