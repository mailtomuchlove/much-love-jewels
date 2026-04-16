"use server";

import { requireAdmin } from "@/lib/auth";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import type { ActionResult } from "@/types";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

type UploadResult = { secure_url: string; public_id: string };

export async function uploadProductImage(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed" };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, error: "Image must be smaller than 5 MB" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "products", {
      transformation: [{ width: 3000, height: 3000, crop: "limit" }],
    });
    return { success: true, data: { secure_url: result.secure_url, public_id: result.public_id } };
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
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG, or WebP images are allowed" };
  }
  if (file.size > MAX_BYTES) {
    return { success: false, error: "Image must be smaller than 5 MB" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, "categories");
    return { success: true, data: { secure_url: result.secure_url, public_id: result.public_id } };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Upload failed" };
  }
}

export async function deleteImage(publicId: string): Promise<ActionResult<void>> {
  await requireAdmin();
  try {
    await deleteFromCloudinary(publicId);
    return { success: true, data: undefined };
  } catch (err) {
    return { success: false, error: (err as Error).message ?? "Delete failed" };
  }
}
