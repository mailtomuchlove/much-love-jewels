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
};

type UploadFolder = "products" | "categories" | "banners";

/**
 * Upload a file buffer to Cloudinary.
 * Wrapped in a Promise because upload_stream uses callbacks.
 */
export function uploadToCloudinary(
  buffer: Buffer,
  folder: UploadFolder,
  options?: Record<string, unknown>
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `muchlovejewels/${folder}`,
        resource_type: "image",
        transformation: [
          // Cap master size to 3000px to save storage
          { width: 3000, height: 3000, crop: "limit" },
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
 * Delete an image from Cloudinary by public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Build a Cloudinary URL with transformations.
 * IMPORTANT: Use <CldImage> on the frontend instead of this where possible.
 */
export function cloudinaryUrl(
  publicId: string,
  width: number,
  height?: number
): string {
  const h = height ? `,h_${height}` : "";
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}${h},c_fill/${publicId}`;
}
