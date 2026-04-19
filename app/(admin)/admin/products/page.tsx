import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ProductsTable } from "./products-table";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, is_active, is_featured, images, categories(name)")
    .order("created_at", { ascending: false });

  const total = products?.length ?? 0;
  const active = products?.filter((p) => p.is_active).length ?? 0;
  const outOfStock = products?.filter((p) => p.stock === 0).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total · {active} active · {outOfStock} out of stock</p>
        </div>
        <Link
          href="/admin/products/new"
          className={buttonVariants() + " bg-brand-navy hover:bg-brand-navy-light text-white gap-2 h-10 rounded-lg shadow-sm"}
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ProductsTable products={products ?? []} />
    </div>
  );
}
