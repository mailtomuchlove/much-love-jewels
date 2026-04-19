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
  product?: Product;
}

function Card({ title, badge, required, children }: { title: string; badge?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <h3 className="font-poppins text-sm font-semibold text-gray-800">
          {title}{required && <span className="text-red-500 ml-0.5">*</span>}
        </h3>
        {badge && <span className="ml-auto text-xs text-gray-400 font-normal">{badge}</span>}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5 mb-1">{hint}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
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

    const validation = productSchema.safeParse({
      name: form.name,
      slug: form.name,
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
      const fieldLabels: Record<string, string> = {
        name: "Product Name",
        price: "Price",
        category_id: "Category",
        stock: "Stock",
        slug: "Product Name",
      };
      const messages = validation.error.issues.map((issue) => {
        const field = issue.path[0] as string;
        return fieldLabels[field] ?? field;
      });
      const unique = [...new Set(messages)];
      toast.error(`Please fill in: ${unique.join(", ")}`);
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
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left column ── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Images */}
          <Card title="Product Images / Videos" required>
            <ImageUpload
              value={images}
              onChange={setImages}
              acceptVideo
              uploadContext={{
                categoryName: categories.find((c) => c.id === form.category_id)?.name,
                productName: form.name || undefined,
              }}
            />
          </Card>

          {/* Basic info */}
          <Card title="Basic Information">
            <Field label="Product Name" required>
              <Input
                required
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. AD Bridal Necklace Set"
                className="h-10"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Product description…"
                rows={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>

            <Field label="Category" required>
              <Select
                value={form.category_id}
                onValueChange={(v) => v && setField("category_id", v)}
              >
                <SelectTrigger className="h-10 w-full">
                  <span className={form.category_id ? "text-sm" : "text-sm text-muted-foreground"}>
                    {form.category_id
                      ? (categories.find((c) => c.id === form.category_id)?.name ?? "Unknown")
                      : "Select a category"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </Card>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-5 space-y-5">

          {/* Pricing & Stock */}
          <Card title="Pricing & Stock">
            <Field label="Product ID" hint="Auto-generated on save, cannot be changed">
              <div className="h-10 flex items-center px-3 rounded-md border border-input bg-gray-50 text-sm font-mono text-gray-500 tracking-wider">
                {product?.product_code ?? <span className="text-gray-400 italic font-sans tracking-normal">Auto-assigned on save</span>}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (₹)" required>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  placeholder="499.00"
                  className="h-10"
                />
              </Field>
              <Field label="Compare Price (₹)" hint="For showing discount">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compare_price}
                  onChange={(e) => setField("compare_price", e.target.value)}
                  placeholder="699.00"
                  className="h-10"
                />
              </Field>
            </div>
            <Field label="Stock" required>
              <Input
                required
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setField("stock", e.target.value)}
                className="h-10"
              />
            </Field>
          </Card>

          {/* Product Details */}
          <Card title="Product Details">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Material">
                <Input
                  value={form.material}
                  onChange={(e) => setField("material", e.target.value)}
                  placeholder="e.g. AD Stone, Kundan"
                  className="h-10"
                />
              </Field>
              <Field label="Weight (grams)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.weight_grams}
                  onChange={(e) => setField("weight_grams", e.target.value)}
                  placeholder="5.50"
                  className="h-10"
                />
              </Field>
            </div>
          </Card>

          {/* Visibility */}
          <Card title="Visibility">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Active</p>
                <p className="text-xs text-gray-400 mt-0.5">Visible on storefront</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setField("is_active", v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Featured</p>
                <p className="text-xs text-gray-400 mt-0.5">Show on homepage</p>
              </div>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => setField("is_featured", v)}
              />
            </div>
          </Card>

          {/* SEO */}
          <Card title="SEO" badge="optional">
            <Field label="Meta Title">
              <Input
                value={form.meta_title}
                onChange={(e) => setField("meta_title", e.target.value)}
                placeholder="Override page title for search engines"
                className="h-10"
              />
            </Field>
            <Field label="Meta Description">
              <textarea
                value={form.meta_description}
                onChange={(e) => setField("meta_description", e.target.value)}
                placeholder="Short description for search results (under 160 chars)"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </Field>
          </Card>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1 pb-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white h-11 font-medium"
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
        </div>
      </div>
    </form>
  );
}
