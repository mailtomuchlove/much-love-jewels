import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Edit Product | Admin" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [productResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name, slug").eq("is_active", true).order("name"),
  ]);

  if (!productResult.data) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
        <h1 className="font-poppins text-2xl font-bold text-gray-900">
          Edit: {productResult.data.name}
        </h1>
      </div>

      <ProductForm
        categories={categoriesResult.data ?? []}
        product={productResult.data}
      />
    </div>
  );
}
