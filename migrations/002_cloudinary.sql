-- Add Cloudinary public_id column to uploads if missing
ALTER TABLE uploads
ADD COLUMN IF NOT EXISTS public_id text;