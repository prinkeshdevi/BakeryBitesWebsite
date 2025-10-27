import { v2 as cloudinary } from "cloudinary";

function isDisabledFlag(): boolean {
  const val = String(process.env.CLOUDINARY_DISABLE || "").toLowerCase().trim();
  return val === "1" || val === "true" || val === "yes";
}

export function isCloudinaryEnabled() {
  if (isDisabledFlag()) return false;
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export function configureCloudinary() {
  if (!isCloudinaryEnabled()) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
    secure: true,
  });
}

export async function uploadLocalFileToCloudinary(
  filePath: string,
  opts?: { folder?: string }
): Promise<{ url: string; publicId: string; resourceType: string }> {
  configureCloudinary();
  const folder = opts?.folder || process.env.CLOUDINARY_UPLOAD_FOLDER || "bakery-bites";
  const res = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: "auto",
  });
  return {
    url: res.secure_url,
    publicId: res.public_id,
    resourceType: res.resource_type,
  };
}

export async function destroyCloudinary(publicId: string) {
  configureCloudinary();
  try {
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
    return res;
  } catch (e) {
    return null;
  }
}