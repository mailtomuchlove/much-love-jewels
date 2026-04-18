"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { uploadProductImage, deleteImage } from "@/app/actions/upload";
import { toast } from "sonner";
import { ImagePlus, Trash2, Crown, Loader2, Play, AlertTriangle } from "lucide-react";
import { isAllowedImageUrl } from "@/lib/image-utils";

export type UploadedImage = {
  secure_url: string;
  public_id: string;
  resource_type?: string;  // "image" | "video"
  uploading?: boolean;
  previewUrl?: string;
};

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[] | ((prev: UploadedImage[]) => UploadedImage[])) => void;
  maxFiles?: number;
  /** Context passed to Cloudinary for organised folder structure */
  uploadContext?: { categoryName?: string; productName?: string };
  /** Accept videos in addition to images */
  acceptVideo?: boolean;
}

const ALLOWED_IMAGES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEOS = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

export function ImageUpload({
  value,
  onChange,
  maxFiles = 6,
  uploadContext,
  acceptVideo = false,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = acceptVideo ? [...ALLOWED_IMAGES, ...ALLOWED_VIDEOS] : ALLOWED_IMAGES;
  const acceptAttr = allowedTypes.join(",");

  async function processFiles(files: File[]) {
    const remaining = maxFiles - value.length;
    const toUpload = files.slice(0, remaining);

    for (const file of toUpload) {
      const isVideo = ALLOWED_VIDEOS.includes(file.type);
      const isImage = ALLOWED_IMAGES.includes(file.type);

      if (!isImage && !isVideo) {
        toast.error(`${file.name}: ${acceptVideo ? "Only JPEG, PNG, WebP or MP4/WebM allowed" : "Only JPEG, PNG, WebP allowed"}`);
        continue;
      }
      if (isImage && file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`${file.name}: Image must be under ${MAX_IMAGE_MB} MB`);
        continue;
      }
      if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
        toast.error(`${file.name}: Video must be under ${MAX_VIDEO_MB} MB`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimistic: UploadedImage = {
        secure_url: previewUrl,
        public_id: tempId,
        resource_type: isVideo ? "video" : "image",
        uploading: true,
        previewUrl,
      };

      onChange((prev) => [...prev, optimistic]);

      const formData = new FormData();
      formData.append("file", file);
      if (uploadContext?.categoryName) formData.append("category_name", uploadContext.categoryName);
      if (uploadContext?.productName)  formData.append("product_name",  uploadContext.productName);

      const result = await uploadProductImage(formData);

      if (!result.success) {
        toast.error(result.error);
        onChange((prev) => prev.filter((img) => img.public_id !== tempId));
        URL.revokeObjectURL(previewUrl);
        continue;
      }

      onChange((prev) =>
        prev.map((img) =>
          img.public_id === tempId
            ? {
                secure_url: result.data.secure_url,
                public_id: result.data.public_id,
                resource_type: result.data.resource_type,
              }
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
      await processFiles(Array.from(e.dataTransfer.files));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, uploadContext]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      await processFiles(Array.from(e.target.files ?? []));
      if (inputRef.current) inputRef.current.value = "";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, uploadContext]
  );

  async function handleDelete(img: UploadedImage, index: number) {
    if (img.uploading) return;
    onChange(value.filter((_, i) => i !== index));
    const resourceType = img.resource_type === "video" ? "video" : "image";
    const result = await deleteImage(img.public_id, resourceType);
    if (!result.success) toast.error("Could not delete: " + result.error);
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
            Drag files here or{" "}
            <span className="text-brand-navy underline">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {acceptVideo
              ? `Images (JPEG/PNG/WebP ≤${MAX_IMAGE_MB}MB) · Videos (MP4/WebM ≤${MAX_VIDEO_MB}MB)`
              : `JPEG, PNG, WebP · max ${MAX_IMAGE_MB}MB`}{" "}
            · up to {maxFiles} files
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((img, i) => {
            const isVideo = img.resource_type === "video";
            return (
              <div
                key={img.public_id}
                className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square"
              >
                {isVideo ? (
                  <>
                    <video
                      src={img.previewUrl ?? img.secure_url}
                      className={`w-full h-full object-cover transition-opacity ${img.uploading ? "opacity-50" : ""}`}
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Play className="h-6 w-6 text-white drop-shadow" />
                    </div>
                  </>
                ) : (() => {
                    const imgSrc = img.previewUrl ?? img.secure_url;
                    const allowed = isAllowedImageUrl(imgSrc);
                    return allowed ? (
                      <Image
                        src={imgSrc}
                        alt={`Upload ${i + 1}`}
                        fill
                        className={`object-cover transition-opacity ${img.uploading ? "opacity-50" : ""}`}
                        sizes="150px"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-red-50 p-2 text-center">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <span className="text-[10px] text-red-500 leading-tight">Invalid URL — delete &amp; re-upload via Cloudinary</span>
                      </div>
                    );
                  })()}

                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  </div>
                )}

                {i === 0 && !img.uploading && (
                  <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold shadow-sm">
                    <Crown className="h-2.5 w-2.5 text-white" />
                  </div>
                )}

                {!img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => moveToFirst(i)}
                        title="Set as main"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-brand-gold hover:text-white transition-colors"
                      >
                        <Crown className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(img, i)}
                      title="Delete"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length}/{maxFiles} files · First file is the main thumbnail
        </p>
      )}
    </div>
  );
}
