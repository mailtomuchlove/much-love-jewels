"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { uploadProductImage, deleteImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { ImagePlus, Trash2, Crown, Loader2 } from "lucide-react";

type UploadedImage = {
  secure_url: string;
  public_id: string;
  uploading?: boolean;
  previewUrl?: string; // local object URL during upload
};

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
}

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_MB = 5;

export function ImageUpload({ value, onChange, maxFiles = 6 }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFiles(files: File[]) {
    const remaining = maxFiles - value.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      if (!ALLOWED.includes(file.type)) {
        toast.error(`${file.name}: Only JPEG, PNG, or WebP allowed`);
        continue;
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        toast.error(`${file.name}: Must be smaller than ${MAX_MB}MB`);
        continue;
      }

      // Optimistic entry
      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimistic: UploadedImage = {
        secure_url: previewUrl,
        public_id: tempId,
        uploading: true,
        previewUrl,
      };

      onChange([...value, optimistic]);

      // Upload
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadProductImage(formData);

      if (!result.success) {
        toast.error(result.error);
        // Remove optimistic entry
        onChange(value.filter((img) => img.public_id !== tempId));
        URL.revokeObjectURL(previewUrl);
        continue;
      }

      // Replace optimistic with real
      onChange((prev: UploadedImage[]) =>
        prev.map((img) =>
          img.public_id === tempId
            ? { secure_url: result.data.secure_url, public_id: result.data.public_id }
            : img
        )
      );
      URL.revokeObjectURL(previewUrl);
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    },
    [value, onChange]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      await processFiles(files);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [value, onChange]
  );

  async function handleDelete(img: UploadedImage, index: number) {
    if (img.uploading) return;
    // Remove from local state immediately
    onChange(value.filter((_, i) => i !== index));
    // Delete from Cloudinary in background
    const result = await deleteImage(img.public_id);
    if (!result.success) {
      toast.error("Could not delete from Cloudinary: " + result.error);
    }
  }

  function moveToFirst(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  }

  const atLimit = value.length >= maxFiles;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!atLimit && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-8 px-4 cursor-pointer transition-colors ${
            dragging
              ? "border-brand-navy bg-brand-navy/5"
              : "border-gray-300 hover:border-brand-navy/50 hover:bg-gray-50"
          }`}
        >
          <ImagePlus className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            Drag images here or{" "}
            <span className="text-brand-navy underline">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPEG, PNG, WebP · max {MAX_MB}MB · up to {maxFiles} images
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(",")}
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((img, i) => (
            <div
              key={img.public_id}
              className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
            >
              <Image
                src={img.previewUrl ?? img.secure_url}
                alt={`Product image ${i + 1}`}
                fill
                className={`object-cover transition-opacity ${img.uploading ? "opacity-50" : "opacity-100"}`}
                sizes="150px"
              />

              {img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                </div>
              )}

              {/* Crown: first image = main thumbnail */}
              {i === 0 && !img.uploading && (
                <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold shadow-sm">
                  <Crown className="h-2.5 w-2.5 text-white" />
                </div>
              )}

              {/* Actions (visible on hover) */}
              {!img.uploading && (
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => moveToFirst(i)}
                      title="Set as main image"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-brand-gold hover:text-white transition-colors"
                    >
                      <Crown className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(img, i)}
                    title="Delete image"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length}/{maxFiles} images · First image is the main thumbnail
        </p>
      )}
    </div>
  );
}
