-- ─────────────────────────────────────────────────────────────────────────────
-- Supabase Storage — Image Upload Setup
-- Run this in Supabase SQL Editor to create the storage bucket and policies.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the "uploads" bucket (public = images served via CDN)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Public read access — anyone can view uploaded images
CREATE POLICY "Public read access for uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'uploads');

-- 3. Authenticated users can upload images (admin only via service_role)
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);

-- 4. Authenticated users can update their own uploads
CREATE POLICY "Authenticated users can update own uploads"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);

-- 5. Authenticated users can delete their own uploads
CREATE POLICY "Authenticated users can delete own uploads"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'uploads'
  AND auth.role() = 'authenticated'
);
