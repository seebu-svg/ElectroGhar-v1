BEGIN;
ALTER TABLE public.hero_images
 ADD COLUMN IF NOT EXISTS video_url text,
 ADD COLUMN IF NOT EXISTS mobile_video_url text;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('hero-videos', 'hero-videos', true, 20971520, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;
-- Public delivery; writes are performed by the authenticated admin API using service_role.
COMMIT;
