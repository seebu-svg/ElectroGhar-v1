-- Apply before deploying the expanded hero editor. Existing images are preserved.
BEGIN;
ALTER TABLE public.hero_images
 ADD COLUMN IF NOT EXISTS eyebrow text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS button_label text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS button_url text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS desktop_position text NOT NULL DEFAULT '65% center',
 ADD COLUMN IF NOT EXISTS mobile_position text NOT NULL DEFAULT '65% center',
 ADD COLUMN IF NOT EXISTS overlay_opacity integer NOT NULL DEFAULT 10 CHECK (overlay_opacity BETWEEN 0 AND 60);
COMMIT;
