"use server";

import { requireAdmin } from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary, toFolderSlug } from "@/lib/cloudinary";
import type { ActionResult } from "@/types";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;  // 100 MB

type UploadResult = { secure_url: string; public_id: string; resource_type: string };

/**
 * Upload a product image or video.
 * FormData fields:
 *   file           — the file blob
 *   category_name  — (optional) category name for folder organisation
 *   product_name   — (optional) product name for folder organisation
 */
export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { success: false, error: "Only JPEG, PNG, WebP images or MP4/WebM videos are allowed" };
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be smaller than 10 MB" };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { success: false, error: "Video must be smaller than 100 MB" };
  }

  // Build organised subfolder: category-slug/product-slug
  const categoryName = (formData.get("category_name") as string | null) ?? "";
  const productName  = (formData.get("product_name")  as string | null) ?? "";
  const parts = [categoryName, productName]
    .map(toFolderSlug)
    .filter(Boolean);
  const subfolder = parts.length ? parts.join("/") : "staging";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "products", subfolder, {
      // Videos skip the image dimension transformation
      transformation: isImage
        ? [{ width: 3000, height: 3000, crop: "limit" }]
        : undefined,
    });
    return {
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Upload failed" };
  }
}

export async function uploadCategoryImage(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be smaller than 10 MB" };
  }

  const categoryName = (formData.get("category_name") as string | null) ?? "";
  const subfolder = toFolderSlug(categoryName) || undefined;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "categories", subfolder);
    return {
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Upload failed" };
  }
}

export async function uploadHeroBannerImage(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

  if (!isImage && !isVideo) {
    return { success: false, error: "Only JPEG, PNG, WebP images or MP4/WebM videos are allowed" };
  }
  if (isImage && file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be smaller than 10 MB" };
  }
  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    return { success: false, error: "Video must be smaller than 100 MB" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "hero-banners", "live");
    return {
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Upload failed" };
  }
}

export async function uploadSectionImage(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be smaller than 10 MB" };
  }

  const tag = (formData.get("tag") as string | null) ?? "";
  const subfolder = toFolderSlug(tag) || "general";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "sections", subfolder, {
      transformation: [{ width: 2400, height: 800, crop: "limit" }],
    });
    return {
      success: true,
      data: {
        secure_url: result.secure_url,
        public_id: result.public_id,
        resource_type: result.resource_type,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Upload failed" };
  }
}

export async function deleteImage(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await deleteFromCloudinary(publicId, resourceType);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Delete failed" };
  }
}
