// SERVER-SIDE ONLY — never import this in client components
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export { cloudinary };

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resource_type: string;
};

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer  File data
 * @param folder  Root folder key: "products", "categories", "banners"
 * @param subfolder  Optional sub-path, e.g. "rings/gold-bracelet" → stored under muchlovejewels/products/rings/gold-bracelet
 * @param options  Any extra Cloudinary upload options
 */
export function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  subfolder?: string,
  options?: Record<string, unknown>
): Promise<CloudinaryUploadResult> {
  const fullFolder = subfolder
    ? `muchlovejewels/${folder}/${subfolder}`
    : `muchlovejewels/${folder}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: fullFolder,
        resource_type: "auto",           // auto-detects image vs video
        transformation: [
          { width: 3000, height: 3000, crop: "limit" },
          { effect: "auto_enhance" },
          { quality: "auto", fetch_format: "auto" },
        ],
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No upload result"));
        resolve(result as CloudinaryUploadResult);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete an asset from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Build an optimised Cloudinary image URL.
 */
export function cloudinaryUrl(
  publicId: string,
  width: number,
  height?: number
): string {
  const h = height ? `,h_${height}` : "";
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}${h},c_fill/${publicId}`;
}

/** Slugify a string for use as a folder segment */
export function toFolderSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
