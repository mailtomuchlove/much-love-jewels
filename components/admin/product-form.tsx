"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./image-upload";
import { createProduct, updateProduct } from "@/app/actions/products";
import { paiseToRupees } from "@/lib/utils";
import { productSchema } from "@/utils/validators";
import { toast } from "sonner";
import type { Category, Product } from "@/types";

type ImageEntry = { secure_url: string; public_id: string; resource_type?: string; uploading?: boolean; previewUrl?: string };

interface ProductFormProps {
  categories: Pick<Category, "id" | "name">[];
  product?: Product; // if present, we're editing
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? paiseToRupees(product.price).toString() : "",
    compare_price: product?.compare_price ? paiseToRupees(product.compare_price).toString() : "",
    category_id: product?.category_id ?? "",
    stock: product?.stock.toString() ?? "0",
    material: product?.material ?? "",
    weight_grams: product?.weight_grams?.toString() ?? "",
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    meta_title: product?.meta_title ?? "",
    meta_description: product?.meta_description ?? "",
  });

  const [images, setImages] = useState<ImageEntry[]>(
    product
      ? (product.images ?? []).map((url, i) => ({
          secure_url: url,
          public_id: (product.image_public_ids ?? [])[i] ?? url,
        }))
      : []
  );

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (images.some((img) => img.uploading)) {
      toast.error("Please wait for images to finish uploading");
      return;
    }

    // Client-side validation before hitting the server
    const validation = productSchema.safeParse({
      name: form.name,
      slug: form.name, // slug is generated server-side; pass name as placeholder
      price: parseFloat(form.price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category_id: form.category_id,
      stock: parseInt(form.stock) || 0,
      material: form.material || undefined,
      weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError?.message ?? "Please check the form fields");
      return;
    }

    setSaving(true);
    const data = {
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category_id: form.category_id,
      stock: parseInt(form.stock),
      material: form.material || undefined,
      weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : null,
      is_active: form.is_active,
      is_featured: form.is_featured,
      images: images.map((img) => img.secure_url),
      image_public_ids: images.map((img) => img.public_id),
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
    };

    const result = product
      ? await updateProduct(product.id, data)
      : await createProduct(data);

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(product ? "Product updated!" : "Product created!");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Images */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-poppins text-sm font-semibold text-gray-800 mb-4">
          Product Images / Videos <span className="text-red-500">*</span>
        </h3>
        <ImageUpload
          value={images}
          onChange={setImages}
          acceptVideo
          uploadContext={{
            categoryName: categories.find((c) => c.id === form.category_id)?.name,
            productName: form.name || undefined,
          }}
        />
      </div>

      {/* Basic info */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">Basic Information</h3>

        <div>
          <Label className="text-xs font-medium">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            required
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. AD Bridal Necklace Set"
            className="mt-1 h-10"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Description</Label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Product description…"
            rows={4}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            required
            value={form.category_id}
            onValueChange={(v) => v && setField("category_id", v)}
          >
            <SelectTrigger className="mt-1 h-10">
              <SelectValue placeholder="Select a category">
                {(v: string | null) =>
                  v ? (categories.find((c) => c.id === v)?.name ?? "Select a category") : null
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">Pricing & Stock</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">
              Price (₹) <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="499.00"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">
              Compare Price (₹) <span className="text-gray-400">(optional, for discount)</span>
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.compare_price}
              onChange={(e) => setField("compare_price", e.target.value)}
              placeholder="699.00"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">
              Stock <span className="text-red-500">*</span>
            </Label>
            <Input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setField("stock", e.target.value)}
              className="mt-1 h-10"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">Product Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Material</Label>
            <Input
              value={form.material}
              onChange={(e) => setField("material", e.target.value)}
              placeholder="e.g. AD Stone, Kundan, Oxidised"
              className="mt-1 h-10"
            />
          </div>
          <div>
            <Label className="text-xs font-medium">Weight (grams)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.weight_grams}
              onChange={(e) => setField("weight_grams", e.target.value)}
              placeholder="5.50"
              className="mt-1 h-10"
            />
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">Visibility</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-gray-400">Visible to customers on the storefront</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v) => setField("is_active", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Featured</p>
              <p className="text-xs text-gray-400">Show on homepage featured section</p>
            </div>
            <Switch
              checked={form.is_featured}
              onCheckedChange={(v) => setField("is_featured", v)}
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">
          SEO <span className="text-xs font-normal text-gray-400">(optional)</span>
        </h3>
        <div>
          <Label className="text-xs font-medium">Meta Title</Label>
          <Input
            value={form.meta_title}
            onChange={(e) => setField("meta_title", e.target.value)}
            placeholder="Override page title for search engines"
            className="mt-1 h-10"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Meta Description</Label>
          <textarea
            value={form.meta_description}
            onChange={(e) => setField("meta_description", e.target.value)}
            placeholder="Short description for search results (under 160 chars)"
            rows={2}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pb-4">
        <Button
          type="submit"
          disabled={saving}
          className="bg-brand-navy hover:bg-brand-navy-light text-white h-11 px-8"
        >
          {saving ? "Saving…" : product ? "Update Product" : "Create Product"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="h-11 px-6"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
