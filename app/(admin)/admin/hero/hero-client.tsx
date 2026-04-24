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
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
  type HeroSlide,
} from "@/app/actions/hero-banners";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Image } from "lucide-react";
import { useRouter } from "next/navigation";

const EMPTY_FORM = {
  headline: "",
  subline: "",
  cta_label: "Shop Now",
  cta_href: "/collections",
  image_src: "",
  overlay_opacity: 60,
  sort_order: 0,
  is_active: true,
};

export function HeroClient({ banners: initial }: { banners: HeroSlide[] }) {
  const [banners, setBanners] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }

  function openEdit(b: HeroSlide) {
    setEditing(b);
    setForm({
      headline: b.headline,
      subline: b.subline,
      cta_label: b.cta_label,
      cta_href: b.cta_href,
      image_src: b.image_src ?? "",
      overlay_opacity: b.overlay_opacity,
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.headline.trim() || !form.cta_href.trim()) {
      toast.error("Headline and CTA link are required.");
      return;
    }
    setSaving(true);
    const result = editing
      ? await updateHeroBanner(editing.id, form)
      : await createHeroBanner(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "Slide updated." : "Slide created.");
    setDialogOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const result = await deleteHeroBanner(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setBanners((prev) => prev.filter((b) => b.id !== id));
    toast.success("Slide deleted.");
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 mt-1">
            {banners.length} slide{banners.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Slide
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          {/* no trigger — controlled via state */}
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Slide" : "New Slide"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="headline">Headline *</Label>
                <Input
                  id="headline"
                  placeholder="Bridal Sets That Steal the Show"
                  value={form.headline}
                  onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                />
                <p className="text-xs text-gray-500">Use \n to add a line break in the headline.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subline">Subline</Label>
                <Input
                  id="subline"
                  placeholder="Short description below the headline"
                  value={form.subline}
                  onChange={(e) => setForm((f) => ({ ...f, subline: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cta_label">Button Label *</Label>
                  <Input
                    id="cta_label"
                    placeholder="Shop Now"
                    value={form.cta_label}
                    onChange={(e) => setForm((f) => ({ ...f, cta_label: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cta_href">Button Link *</Label>
                  <Input
                    id="cta_href"
                    placeholder="/collections"
                    value={form.cta_href}
                    onChange={(e) => setForm((f) => ({ ...f, cta_href: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="image_src">Image/Video URL (Cloudinary)</Label>
                <Input
                  id="image_src"
                  placeholder="https://res.cloudinary.com/..."
                  value={form.image_src}
                  onChange={(e) => setForm((f) => ({ ...f, image_src: e.target.value }))}
                />
                <p className="text-xs text-gray-500">
                  Upload to Cloudinary first, then paste the URL here. Supports .jpg, .webp, .mp4.
                  Leave blank for gradient background.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="overlay_opacity">Overlay Opacity (0–100)</Label>
                  <Input
                    id="overlay_opacity"
                    type="number"
                    min={0}
                    max={100}
                    value={form.overlay_opacity}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        overlay_opacity: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      }))
                    }
                  />
                  <p className="text-xs text-gray-500">Higher = darker overlay over image.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))
                    }
                  />
                  <p className="text-xs text-gray-500">Lower number = shown first.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
                <Label htmlFor="is_active">Active (visible on storefront)</Label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving…" : "Save Slide"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <Image className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No hero slides yet. Add your first slide above.</p>
          <p className="text-xs text-gray-400 mt-1">
            Until slides are added, the storefront shows built-in placeholder banners.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm ${
                !b.is_active ? "opacity-50" : ""
              }`}
            >
              {/* Preview thumbnail */}
              <div className="flex-shrink-0 h-16 w-24 rounded bg-brand-navy/10 overflow-hidden flex items-center justify-center text-xs text-gray-400">
                {b.image_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image_src}
                    alt={b.headline}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-center px-1">Gradient BG</span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                  {!b.is_active && (
                    <span className="text-[10px] rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="font-medium text-sm text-gray-900 leading-snug line-clamp-1">
                  {b.headline.replace("\\n", " ")}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{b.subline}</p>
                <p className="text-xs text-brand-navy mt-1 font-medium">
                  {b.cta_label} → <span className="font-normal">{b.cta_href}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => openEdit(b)}
                  title="Edit"
                >
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
                      <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes &quot;{b.headline.replace("\\n", " ")}&quot; from the hero banner. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(b.id)}
                      >
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

      {banners.length > 0 && (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-sm font-medium text-amber-800">Cloudinary Setup</p>
          <p className="text-xs text-amber-700 mt-1">
            Upload banner images to Cloudinary (Dashboard → Media Library → Upload). Recommended: 1400×580 px, JPG/WebP, under 500 KB. Copy the URL and paste it in the Image URL field above.
          </p>
        </div>
      )}
    </div>
  );
}
