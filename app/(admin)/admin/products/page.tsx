import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProductsTable } from "./products-table";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products | Admin" };

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, stock, is_active, is_featured, images, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products?.length ?? 0} total products
          </p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants() + " bg-brand-navy hover:bg-brand-navy-light text-white gap-2 h-10"}>
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <ProductsTable products={products ?? []} />
    </div>
  );
}
