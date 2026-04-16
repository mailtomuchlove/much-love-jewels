"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { deleteProduct, toggleProductStatus } from "@/app/actions/products";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { Pencil, Trash2, Search, Star } from "lucide-react";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  categories: { name: string } | null;
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categories?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggle(id: string, newValue: boolean) {
    startTransition(async () => {
      const result = await toggleProductStatus(id, newValue);
      if (!result.success) toast.error(result.error);
    });
  }

  async function handleDelete(id: string) {
    const result = await deleteProduct(id);
    if (!result.success) toast.error(result.error);
    else toast.success("Product deleted");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No products found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                      {product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1 max-w-[200px]">
                        {product.name}
                      </p>
                      {product.is_featured && (
                        <span className="inline-flex items-center gap-1 text-xs text-brand-gold font-medium">
                          <Star className="h-2.5 w-2.5 fill-brand-gold" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {product.categories?.name ?? "—"}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`font-medium ${
                      product.stock === 0
                        ? "text-red-600"
                        : product.stock <= 5
                        ? "text-orange-600"
                        : "text-gray-700"
                    }`}
                  >
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={product.is_active}
                    onCheckedChange={(v) => handleToggle(product.id, v)}
                    disabled={isPending}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className={buttonVariants({ variant: "ghost", size: "sm" }) + " h-8 w-8 p-0"}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete product?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{product.name}&quot; and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(product.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
