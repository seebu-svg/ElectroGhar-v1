-- Run only in a disposable seeded test database.
-- Before applying the upgrade: CREATE TEMP TABLE before_products AS SELECT id,name,price FROM products;
-- Then apply the upgrade in the same psql session, followed by these assertions.
DO $$ DECLARE roots text[]; c uuid; replacement uuid; product_id uuid; slug_before text; BEGIN
 IF (SELECT count(*) FROM products) != (SELECT count(*) FROM before_products) THEN RAISE EXCEPTION 'Products lost'; END IF;
 IF EXISTS(SELECT * FROM before_products EXCEPT SELECT id,name,price FROM products) THEN RAISE EXCEPTION 'Product content changed'; END IF;
 SELECT array_agg(name ORDER BY sort_order) INTO roots FROM categories WHERE is_active AND parent_id IS NULL;
 IF roots != ARRAY['Laptops','PCs & Desktops','Monitors & Displays','Mobile Phones','Accessories'] THEN RAISE EXCEPTION 'Wrong navigation order: %',roots; END IF;
 IF (SELECT count(*) FROM categories WHERE is_active AND parent_id IS NOT NULL) != 33 THEN RAISE EXCEPTION 'Wrong subcategory count'; END IF;
 IF EXISTS(SELECT 1 FROM products p JOIN categories c ON c.slug=p.category WHERE NOT c.is_active) THEN RAISE EXCEPTION 'Products left in inactive categories'; END IF;
 SELECT cat.id, p.id, p.category INTO c,product_id,slug_before FROM products p JOIN categories cat ON cat.slug=p.category LIMIT 1;
 BEGIN PERFORM remove_catalog_category(c); RAISE EXCEPTION 'Deletion incorrectly allowed';
 EXCEPTION WHEN OTHERS THEN IF SQLERRM NOT LIKE 'Products must be reassigned%' THEN RAISE; END IF; END;
 SELECT id INTO replacement FROM categories WHERE slug='accessories-mobile-accessories' AND id!=c;
 PERFORM remove_catalog_category(c,replacement);
 IF EXISTS(SELECT 1 FROM products WHERE category=slug_before) THEN RAISE EXCEPTION 'Reassignment failed'; END IF;
 IF (SELECT count(*) FROM products) != (SELECT count(*) FROM before_products) THEN RAISE EXCEPTION 'Deletion lost products'; END IF;
 INSERT INTO hero_images(desktop_url,mobile_url,sort_order) VALUES('https://example.com/desktop.png','https://example.com/mobile.png',1);
 UPDATE hero_images SET sort_order=0,is_active=false;
 IF (SELECT count(*) FROM hero_images WHERE is_active) != 0 THEN RAISE EXCEPTION 'Hero activation failed'; END IF;
 DELETE FROM hero_images;
 RAISE NOTICE 'PASS: products preserved, exact taxonomy, deletion guard, atomic reassignment, hero lifecycle';
END $$;
