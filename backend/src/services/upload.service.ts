import { v2 as cloudinary } from "cloudinary";

// Configure from env
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"] as string,
  api_key:    process.env["CLOUDINARY_API_KEY"]    as string,
  api_secret: process.env["CLOUDINARY_API_SECRET"] as string,
  secure:     true,
});

// Startup validation — will appear in Railway logs
const missing = (["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"] as const)
  .filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error("❌ Missing Cloudinary env vars:", missing.join(", "));
} else {
  console.log("✅ Cloudinary configured — cloud:", process.env["CLOUDINARY_CLOUD_NAME"]);
}

export interface UploadResult {
  url:      string;
  fileName: string;
  fileType: "image" | "file";
}

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

/**
 * Upload a file buffer to Cloudinary.
 * Images go into the `chat-images` folder; other files go into `chat-files`.
 */
export async function uploadToCloudinary(
  buffer:   Buffer,
  originalName: string,
  mimeType: string
): Promise<UploadResult> {
  const isImage    = IMAGE_MIMES.has(mimeType);
  const folder     = isImage ? "chat-images" : "chat-files";
  const resourceType: "image" | "raw" = isImage ? "image" : "raw";

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, use_filename: true, unique_filename: true },
      (err, res) => {
        if (err || !res) reject(err ?? new Error("Cloudinary upload failed"));
        else resolve(res);
      }
    );
    stream.end(buffer);
  });

  return {
    url:      result.secure_url,
    fileName: originalName,
    fileType: isImage ? "image" : "file",
  };
}
