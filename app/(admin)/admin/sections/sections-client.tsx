"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  type HomepageSection,
} from "@/app/actions/homepage-sections";
import { uploadSectionImage, deleteImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Layers, Tag, ImagePlus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const EMPTY_FORM = {
  title: "",
  tag: "",
  subtitle: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

interface SectionsClientProps {
  sections: HomepageSection[];
  availableTags: string[];
}

export function SectionsClient({ sections: initial, availableTags }: SectionsClientProps) {
  const [sections, setSections] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HomepageSection | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customTag, setCustomTag] = useState("");
  const [useCustomTag, setUseCustomTag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setCustomTag("");
    setUseCustomTag(false);
    setImagePublicId(null);
    setDialogOpen(true);
  }

  function openEdit(s: HomepageSection) {
    setEditing(s);
    const tagInList = availableTags.includes(s.tag);
    setUseCustomTag(!tagInList);
    setCustomTag(tagInList ? "" : s.tag);
    setImagePublicId(null);
    setForm({
      title: s.title,
      tag: tagInList ? s.tag : "",
      subtitle: s.subtitle ?? "",
      image_url: s.image_url ?? "",
      sort_order: s.sort_order,
      is_active: s.is_active,
    });
    setDialogOpen(true);
  }

  function resolvedTag() {
    return useCustomTag ? customTag.trim().toLowerCase() : form.tag;
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("tag", resolvedTag() || "general");

    const result = await uploadSectionImage(fd);
    setUploading(false);

    if (!result.success) {
      toast.error(result.error ?? "Upload failed");
      return;
    }
    setForm((f) => ({ ...f, image_url: result.data.secure_url }));
    setImagePublicId(result.data.public_id);
    toast.success("Banner uploaded");
  }

  async function handleRemoveImage() {
    if (imagePublicId) {
      await deleteImage(imagePublicId);
    }
    setForm((f) => ({ ...f, image_url: "" }));
    setImagePublicId(null);
  }

  async function handleSave() {
    const tag = resolvedTag();
    if (!form.title.trim()) { toast.error("Section title is required."); return; }
    if (!tag) { toast.error("Please select or enter a tag."); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        tag,
        subtitle: form.subtitle || null,
        image_url: form.image_url || null,
      };
      if (editing) {
        await updateHomepageSection(editing.id, payload);
        toast.success("Section updated.");
      } else {
        await createHomepageSection(payload);
        toast.success("Section created.");
      }
      setDialogOpen(false);
      router.refresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success("Section deleted.");
      router.refresh();
    } catch {
      toast.error("Failed to delete section.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {sections.length} section{sections.length !== 1 ? "s" : ""}
        </p>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Section
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Section" : "New Homepage Section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">

              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">Section Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. Handpicked Picks"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Shown as the section heading on the homepage.</p>
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <Label htmlFor="subtitle">Subtitle <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  id="subtitle"
                  placeholder="e.g. Curated for the modern bride"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Short line shown below the heading.</p>
              </div>

              {/* Tag */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Tag *</Label>
                  <button
                    type="button"
                    className="text-xs text-brand-navy underline"
                    onClick={() => { setUseCustomTag((v) => !v); setCustomTag(""); setForm((f) => ({ ...f, tag: "" })); }}
                  >
                    {useCustomTag ? "Pick from list" : "Enter custom tag"}
                  </button>
                </div>
                {useCustomTag ? (
                  <Input
                    placeholder="e.g. handpicked"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                  />
                ) : (
                  <Select
                    value={form.tag}
                    onValueChange={(v) => v && setForm((f) => ({ ...f, tag: v }))}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <span className={form.tag ? "text-sm" : "text-sm text-muted-foreground"}>
                        {form.tag || "Select a tag"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-400">
                          No tags found — add tags to your products first.
                        </div>
                      )}
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500">Products with this tag will appear in this section.</p>
              </div>

              {/* Banner image */}
              <div className="space-y-1.5">
                <Label>Banner Image <span className="text-gray-400 font-normal">(optional)</span></Label>
                {form.image_url ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 aspect-[3/1]">
                    <Image
                      src={form.image_url}
                      alt="Section banner"
                      fill
                      className="object-cover"
                      sizes="480px"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                      title="Remove banner"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-6 text-sm text-gray-500 hover:border-brand-navy/40 hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    {uploading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Uploading…</>
                    ) : (
                      <><ImagePlus className="h-5 w-5 text-gray-400" /> Click to upload banner image</>
                    )}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <p className="text-xs text-gray-500">Shown as a wide banner above the product grid. JPEG/PNG/WebP, max 10 MB.</p>
              </div>

              {/* Sort order + active */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-gray-500">Lower = shown first.</p>
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex items-center gap-2 pb-1">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <p className="text-xs text-gray-500">Visible on homepage.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || uploading}>
                  {saving ? "Saving…" : "Save Section"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <Layers className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No homepage sections yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Add a section to show a curated product list on the homepage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-4 rounded-lg border bg-white p-4 shadow-sm ${!s.is_active ? "opacity-50" : ""}`}
            >
              {/* Banner thumbnail */}
              {s.image_url && (
                <div className="relative flex-shrink-0 w-16 h-10 rounded overflow-hidden border border-gray-200">
                  <Image src={s.image_url} alt="" fill className="object-cover" sizes="64px" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                  {!s.is_active && (
                    <span className="text-[10px] rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">Hidden</span>
                  )}
                </div>
                <p className="font-medium text-sm text-gray-900">{s.title}</p>
                {s.subtitle && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{s.subtitle}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <Tag className="h-3 w-3 text-brand-gold" />
                  <span className="text-xs text-brand-navy font-mono">{s.tag}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openEdit(s)} title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input text-red-500 hover:text-red-600 hover:border-red-300 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete &quot;{s.title}&quot;?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes the section from the homepage. Products are not affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleDelete(s.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {sections.length > 0 && (
        <p className="text-xs text-gray-400 mt-4">
          Sections with no matching tagged products are hidden automatically on the homepage.
        </p>
      )}
    </div>
  );
}
