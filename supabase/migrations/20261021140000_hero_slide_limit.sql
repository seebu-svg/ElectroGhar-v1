-- Serialize inserts so concurrent requests cannot exceed three image/video slides.
-- Existing slides remain available for editing and deletion.
CREATE OR REPLACE FUNCTION public.enforce_hero_slide_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(721041, 3);
  IF (SELECT count(*) FROM public.hero_images) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 hero slides allowed, including images and videos. Edit or remove an existing slide.'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS hero_slide_limit ON public.hero_images;
CREATE TRIGGER hero_slide_limit
BEFORE INSERT ON public.hero_images
FOR EACH ROW EXECUTE FUNCTION public.enforce_hero_slide_limit();
