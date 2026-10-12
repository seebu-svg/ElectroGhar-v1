-- Non-destructive catalog upgrade. Run once through Supabase migrations.
BEGIN;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id);
-- Retain old categories for reference; products are reassigned below.
CREATE TEMP TABLE old_category_roots AS
WITH RECURSIVE roots AS (
 SELECT id, slug, slug AS root_slug FROM categories WHERE parent_id IS NULL
 UNION ALL SELECT c.id, c.slug, r.root_slug FROM categories c JOIN roots r ON c.parent_id=r.id
) SELECT * FROM roots;
UPDATE categories SET is_active=false;
INSERT INTO categories(name,slug,sort_order,is_active,parent_id) VALUES ('Laptops','laptops',0,true,null) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=true,parent_id=null;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'HP','laptops-hp',id,0,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Dell','laptops-dell',id,1,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Lenovo','laptops-lenovo',id,2,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Toshiba','laptops-toshiba',id,3,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Asus','laptops-asus',id,4,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Acer','laptops-acer',id,5,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'MSI','laptops-msi',id,6,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Other Brands','laptops-other-brands',id,7,true FROM categories WHERE slug='laptops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,sort_order,is_active,parent_id) VALUES ('PCs & Desktops','pcs-desktops',1,true,null) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=true,parent_id=null;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'HP','pcs-desktops-hp',id,0,true FROM categories WHERE slug='pcs-desktops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Dell','pcs-desktops-dell',id,1,true FROM categories WHERE slug='pcs-desktops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Lenovo','pcs-desktops-lenovo',id,2,true FROM categories WHERE slug='pcs-desktops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Custom PCs','pcs-desktops-custom-pcs',id,3,true FROM categories WHERE slug='pcs-desktops' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,sort_order,is_active,parent_id) VALUES ('Monitors & Displays','monitors-displays',2,true,null) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=true,parent_id=null;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'HP','monitors-displays-hp',id,0,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Dell','monitors-displays-dell',id,1,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Lenovo','monitors-displays-lenovo',id,2,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Asus','monitors-displays-asus',id,3,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Acer','monitors-displays-acer',id,4,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Sony','monitors-displays-sony',id,5,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Samsung','monitors-displays-samsung',id,6,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Other Brands','monitors-displays-other-brands',id,7,true FROM categories WHERE slug='monitors-displays' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,sort_order,is_active,parent_id) VALUES ('Mobile Phones','mobile-phones',3,true,null) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=true,parent_id=null;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Samsung','mobile-phones-samsung',id,0,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Apple iPhone','mobile-phones-apple-iphone',id,1,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Google Pixel','mobile-phones-google-pixel',id,2,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Oppo','mobile-phones-oppo',id,3,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Vivo','mobile-phones-vivo',id,4,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Infinix','mobile-phones-infinix',id,5,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Itel','mobile-phones-itel',id,6,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Xiaomi','mobile-phones-xiaomi',id,7,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Tecno','mobile-phones-tecno',id,8,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Other Brands','mobile-phones-other-brands',id,9,true FROM categories WHERE slug='mobile-phones' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,sort_order,is_active,parent_id) VALUES ('Accessories','accessories',4,true,null) ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,sort_order=EXCLUDED.sort_order,is_active=true,parent_id=null;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Laptop Accessories','accessories-laptop-accessories',id,0,true FROM categories WHERE slug='accessories' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'PCs & Desktop Accessories','accessories-pcs-desktop-accessories',id,1,true FROM categories WHERE slug='accessories' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
INSERT INTO categories(name,slug,parent_id,sort_order,is_active) SELECT 'Mobile Accessories','accessories-mobile-accessories',id,2,true FROM categories WHERE slug='accessories' ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,parent_id=EXCLUDED.parent_id,sort_order=EXCLUDED.sort_order,is_active=true;
-- Brand children for computers, displays and phones; accessories are routed by legacy name.
UPDATE products p SET category='accessories-laptop-accessories'
WHERE category IN (SELECT slug FROM old_category_roots WHERE slug LIKE '%laptop-accessor%');
UPDATE products p SET category='accessories-pcs-desktop-accessories'
WHERE category IN (SELECT slug FROM old_category_roots WHERE slug IN ('pc-accessories','desktop-accessories'));
UPDATE products p SET category='accessories-mobile-accessories'
WHERE category IN (SELECT slug FROM old_category_roots WHERE root_slug='gadgets-electronics');
UPDATE products p SET category = COALESCE(
 (SELECT c.slug FROM categories c JOIN categories parent ON parent.id=c.parent_id
  WHERE parent.slug = CASE r.root_slug
    WHEN 'storage-accessories' THEN 'accessories'
    WHEN 'smartphones' THEN 'mobile-phones'
    WHEN 'phones-tablets' THEN 'mobile-phones'
    ELSE r.root_slug END
  AND c.is_active AND lower(c.name)=CASE
    WHEN r.root_slug IN ('storage-accessories','accessories') THEN
      CASE WHEN r.slug LIKE '%laptop%' THEN 'laptop accessories' WHEN r.slug LIKE '%mobile%' THEN 'mobile accessories' ELSE 'pcs & desktop accessories' END
    WHEN lower(p.brand) IN ('apple','iphone') THEN 'apple iphone'
    WHEN lower(p.brand) IN ('google','pixel') THEN 'google pixel'
    ELSE lower(p.brand) END LIMIT 1),
 (SELECT c.slug FROM categories c JOIN categories parent ON parent.id=c.parent_id
  WHERE parent.slug=r.root_slug AND c.is_active AND c.name IN ('Other Brands','Custom PCs') LIMIT 1),
 CASE WHEN r.root_slug IN ('storage-accessories','accessories') THEN 'accessories-pcs-desktop-accessories'
      ELSE 'accessories-pcs-desktop-accessories' END)
FROM old_category_roots r WHERE p.category=r.slug
 AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.slug=p.category AND c.is_active AND c.parent_id IS NOT NULL);

-- Serialize hierarchy changes so concurrent edits cannot introduce cycles.
CREATE OR REPLACE FUNCTION validate_catalog_parent() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE parent categories;
BEGIN
 PERFORM pg_advisory_xact_lock(74639210);
 IF NEW.parent_id IS NOT NULL THEN
   SELECT * INTO parent FROM categories WHERE id=NEW.parent_id;
   IF NOT FOUND OR parent.parent_id IS NOT NULL OR NEW.parent_id=NEW.id THEN
     RAISE EXCEPTION 'Subcategories must belong to a main category';
   END IF;
   IF EXISTS(SELECT 1 FROM categories WHERE parent_id=NEW.id) THEN
     RAISE EXCEPTION 'Move or remove children before changing the parent';
   END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_catalog_parent ON categories;
CREATE TRIGGER trg_catalog_parent BEFORE INSERT OR UPDATE OF parent_id ON categories
FOR EACH ROW EXECUTE FUNCTION validate_catalog_parent();

CREATE TABLE IF NOT EXISTS hero_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 desktop_url text NOT NULL, mobile_url text, alt text NOT NULL DEFAULT '',
 sort_order integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE hero_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public hero images" ON hero_images;
CREATE POLICY "Public hero images" ON hero_images FOR SELECT USING(is_active);

CREATE OR REPLACE FUNCTION remove_catalog_category(category_id uuid, replacement_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE source categories; target categories;
BEGIN
 SELECT * INTO source FROM categories WHERE id=category_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Category not found'; END IF;
 IF EXISTS(SELECT 1 FROM categories WHERE parent_id=category_id) THEN
   RAISE EXCEPTION 'Remove or move subcategories first';
 END IF;
 IF replacement_id IS NOT NULL THEN
   SELECT * INTO target FROM categories WHERE id=replacement_id FOR UPDATE;
   IF NOT FOUND OR target.id=source.id OR NOT target.is_active THEN RAISE EXCEPTION 'Choose another active category'; END IF;
   IF target.parent_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM categories WHERE id=target.parent_id AND is_active) THEN RAISE EXCEPTION 'Replacement parent must be active'; END IF;
   UPDATE products SET category=target.slug WHERE category=source.slug;
 ELSIF EXISTS(SELECT 1 FROM products WHERE category=source.slug) THEN
   RAISE EXCEPTION 'Products must be reassigned before deleting this category';
 END IF;
 DELETE FROM categories WHERE id=category_id;
END $$;
REVOKE ALL ON FUNCTION remove_catalog_category(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION remove_catalog_category(uuid,uuid) TO service_role;
-- Remove legacy policies that permitted every authenticated user to write.
DO $$ DECLARE p record; BEGIN
 FOR p IN SELECT policyname, tablename FROM pg_policies WHERE schemaname='public'
 AND tablename IN ('products','categories','blogs','blog_categories','hero_images') AND cmd IN ('ALL','INSERT','UPDATE','DELETE')
 LOOP EXECUTE format('DROP POLICY %I ON %I',p.policyname,p.tablename); END LOOP;
END $$;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own uploads" ON storage.objects;
COMMIT;
