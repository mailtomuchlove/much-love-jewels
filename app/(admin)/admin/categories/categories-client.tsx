"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  image_url: "",
  is_active: true,
  sort_order: 0,
};

export function CategoriesClient({
  categories: initial,
}: {
  categories: CategoryRow[];
}) {
  const [categories, setCategories] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(cat: CategoryRow) {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      image_url: cat.image_url ?? "",
      is_active: cat.is_active,
      sort_order: cat.sort_order,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const data = {
      name: form.name,
      description: form.description || undefined,
      image_url: form.image_url || undefined,
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    const result = editing
      ? await updateCategory(editing.id, data)
      : await createCategory(data);

    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(editing ? "Category updated!" : "Category created!");
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteCategory(id);
    if (!result.success) {
      toast.error(result.error);
    } else {
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={openNew}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Necklaces"
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description"
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Image URL</Label>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://res.cloudinary.com/…"
                  className="mt-1 h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium">Sort Order</Label>
                  <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))
                    }
                    className="mt-1 h-10"
                  />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={form.is_active}
                      onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))}
                    />
                    <Label className="text-xs font-medium">Active</Label>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="w-full bg-brand-navy hover:bg-brand-navy-light text-white h-10"
              >
                {saving ? "Saving…" : editing ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No categories yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Products</th>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.product_count}</td>
                  <td className="px-4 py-3 text-gray-600">{cat.sort_order}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete category?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete &quot;{cat.name}&quot;. Products in this category will
                              need to be reassigned.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(cat.id)}
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
        </div>
      )}
    </div>
  );
}
