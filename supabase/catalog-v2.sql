-- ============================================================
-- ElectroGhar , Catalog v2 (Full Reset)
-- 5 top-level categories + 54 subcategories + 60 products
-- Run in Supabase SQL Editor (replaces previous catalog)
-- Admin auth users are NOT affected.
-- ============================================================

-- ── 0. Reset ─────────────────────────────────────────────────
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- ── 1. Categories (with hierarchy) ───────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ── 2. Products ──────────────────────────────────────────────
CREATE TABLE products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  brand            TEXT NOT NULL,
  category         TEXT NOT NULL REFERENCES categories(slug),

  -- Pricing
  price            NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  currency         TEXT DEFAULT 'PKR',

  -- Media
  images           JSONB DEFAULT '[]'::jsonb,
  thumbnail_url    TEXT,

  -- Specifications (flexible JSON)
  specs            JSONB DEFAULT '{}'::jsonb,

  -- Condition
  condition_type   TEXT NOT NULL DEFAULT 'used'
                   CHECK (condition_type IN ('new', 'used', 'refurbished')),
  condition_grade  TEXT DEFAULT 'Good'
                   CHECK (condition_grade IN ('New', 'Like New', 'Excellent', 'Good', 'Fair')),
  battery_health   TEXT,
  warranty         TEXT,
  stock_qty        INT DEFAULT 1,
  is_available     BOOLEAN DEFAULT true,

  -- Flags
  is_featured      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,

  -- Full-text search (auto-generated from name+brand+description+specs)
  search_text      TEXT GENERATED ALWAYS AS (
                     coalesce(name, '') || ' ' || coalesce(brand, '') || ' ' ||
                     coalesce(description, '') || ' ' || coalesce(specs::text, '')
                   ) STORED,

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,

  -- WhatsApp
  whatsapp_number  TEXT DEFAULT '+923001234567',

  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_brand          ON products(brand);
CREATE INDEX idx_products_category       ON products(category);
CREATE INDEX idx_products_condition_type ON products(condition_type);
CREATE INDEX idx_products_featured       ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_active         ON products(is_active)   WHERE is_active  = true;
CREATE INDEX idx_products_price          ON products(price);
CREATE INDEX idx_products_condition      ON products(condition_grade);

-- ── 3. Auto-update updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products"   ON products   FOR SELECT USING (is_active = true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "Admin insert products"   ON products   FOR INSERT TO authenticated   WITH CHECK (true);
CREATE POLICY "Admin update products"   ON products   FOR UPDATE TO authenticated   USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete products"   ON products   FOR DELETE TO authenticated   USING (true);
CREATE POLICY "Admin insert categories" ON categories FOR INSERT TO authenticated   WITH CHECK (true);
CREATE POLICY "Admin update categories" ON categories FOR UPDATE TO authenticated   USING (true) WITH CHECK (true);
CREATE POLICY "Admin delete categories" ON categories FOR DELETE TO authenticated   USING (true);

-- ── 5. Top-level categories ──────────────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, is_featured) VALUES
  ('Laptops',                   'laptops',               'New & used laptops from every major brand',      '💻', 1, true),
  ('PCs & Desktops',            'pcs-desktops',          'Desktops, gaming rigs, workstations & mini PCs', '🖥️', 2, true),
  ('Monitors & Displays',       'monitors-displays',     'Gaming, 4K, ultrawide & professional monitors',  '📺', 3, true),
  ('Storage & Accessories',     'storage-accessories',   'SSDs, HDDs, RAM, keyboards, mice & more',        '💾', 4, true),
  ('Gadgets & Electronics',     'gadgets-electronics',   'Smart watches, earbuds, power banks & gadgets',  '⚡', 5, true);

-- ── 6. Laptops subcategories ─────────────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, parent_id)
SELECT v.name, v.slug, v.description, v.icon, v.sort_order, c.id
FROM (VALUES
  ('New Laptops',           'laptops-new',           'Brand new sealed laptops with official warranty',        '🆕', 1),
  ('Used Laptops',          'laptops-used',          'Quality checked second-hand laptops',                    '♻️', 2),
  ('Refurbished Laptops',   'laptops-refurbished',   'Professionally refurbished & tested laptops',            '🔧', 3),
  ('Business Laptops',      'business-laptops',      'Reliable workhorses for professionals',                  '💼', 4),
  ('Gaming Laptops',        'gaming-laptops',        'High-performance machines for gamers',                   '🎮', 5),
  ('Student Laptops',       'student-laptops',       'Budget-friendly for everyday study',                     '📚', 6),
  ('Ultrabooks',            'ultrabooks',            'Thin, light and premium portability',                    '✨', 7),
  ('2-in-1 / Convertible',  '2-in-1-convertibles',   'Touchscreen laptops that flip into tablets',             '🔄', 8),
  ('MacBooks',              'macbooks',              'Apple MacBook Air & Pro , used and refurbished',         '🍎', 9),
  ('Laptop Accessories',    'laptop-accessories',    'Chargers, batteries, docking stations & stands',        '🎧', 10)
) AS v(name, slug, description, icon, sort_order)
JOIN categories c ON c.slug = 'laptops';

-- ── 7. PCs & Desktops subcategories ──────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, parent_id)
SELECT v.name, v.slug, v.description, v.icon, v.sort_order, c.id
FROM (VALUES
  ('Desktop PCs',      'desktop-pcs',      'Complete desktop computers for home & office',  '🖥️', 1),
  ('Used PCs',         'used-pcs',         'Tested second-hand desktop computers',          '♻️', 2),
  ('Gaming PCs',       'gaming-pcs',       'Ready-to-game builds with RTX graphics',        '🎮', 3),
  ('Business PCs',     'business-pcs',     'Office-grade desktops for productivity',        '🏢', 4),
  ('All-in-One PCs',   'all-in-one-pcs',   'Slim all-in-one computers with built-in screen','📺', 5),
  ('Mini PCs',         'mini-pcs',         'Compact palm-sized computing power',            '📦', 6),
  ('Workstations',     'workstations',     'Certified power for CAD, 3D & rendering',       '⚙️', 7),
  ('Custom PC Builds', 'custom-pc-builds', 'Your dream PC, built & tested by us',           '🛠️', 8),
  ('PC Components',    'pc-components',    'CPUs, GPUs, motherboards, PSUs & cases',        '🔩', 9),
  ('PC Accessories',   'pc-accessories',   'Everything to complete your desktop setup',     '🖱️', 10)
) AS v(name, slug, description, icon, sort_order)
JOIN categories c ON c.slug = 'pcs-desktops';

-- ── 8. Monitors & Displays subcategories ─────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, parent_id)
SELECT v.name, v.slug, v.description, v.icon, v.sort_order, c.id
FROM (VALUES
  ('LED Monitors',          'led-monitors',          'Sharp & energy-efficient LED displays',     '📺', 1),
  ('LCD Monitors',          'lcd-monitors',          'Classic LCD panels at great prices',        '🖼️', 2),
  ('Gaming Monitors',       'gaming-monitors',       'High refresh rate 144Hz+ displays',         '🎮', 3),
  ('Professional Monitors', 'professional-monitors', 'Color-accurate displays for creators',      '🎨', 4),
  ('Ultrawide Monitors',    'ultrawide-monitors',    'Immersive 21:9 ultrawide screens',          '↔️', 5),
  ('4K Monitors',           '4k-monitors',           'Stunning 4K UHD resolution',                '🔍', 6),
  ('Curved Monitors',       'curved-monitors',       'Wrap-around curved immersion',              '🌙', 7),
  ('Used Monitors',         'used-monitors',         'Tested used monitors at bargain prices',    '♻️', 8),
  ('Monitor Accessories',   'monitor-accessories',   'Stands, arms, mounts & calibration tools',  '🔧', 9)
) AS v(name, slug, description, icon, sort_order)
JOIN categories c ON c.slug = 'monitors-displays';

-- ── 9. Storage & Accessories subcategories ───────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, parent_id)
SELECT v.name, v.slug, v.description, v.icon, v.sort_order, c.id
FROM (VALUES
  ('External Hard Drives', 'external-hard-drives', 'Portable HDD storage for backups',       '💽', 1),
  ('External SSDs',        'external-ssds',        'Blazing-fast portable SSD storage',      '⚡', 2),
  ('Internal SSDs',        'internal-ssds',        'NVMe & SATA SSDs to speed up your PC',   '🚀', 3),
  ('HDDs',                 'hdds',                 'High-capacity hard disk drives',         '💿', 4),
  ('USB Flash Drives',     'usb-flash-drives',     'Pen drives & OTG flash storage',         '🔑', 5),
  ('Memory Cards',         'memory-cards',         'SD, microSD & flash memory cards',       '🎴', 6),
  ('RAM',                  'ram',                  'DDR4 & DDR5 memory upgrades',            '🧠', 7),
  ('Laptop Chargers',      'laptop-chargers',      'Original & compatible laptop adapters',  '🔌', 8),
  ('Laptop Bags',          'laptop-bags',          'Backpacks, sleeves & briefcases',        '🎒', 9),
  ('Keyboards',            'keyboards',            'Mechanical, wireless & gaming keyboards','⌨️', 10),
  ('Mice',                 'mice',                 'Wireless, gaming & ergonomic mice',      '🖱️', 11),
  ('Webcams',              'webcams',              'HD & 4K webcams for calls & streaming',  '📷', 12),
  ('USB Hubs',             'usb-hubs',             'Expand your ports with USB hubs',        '🔀', 13),
  ('Adapters & Cables',    'adapters-cables',      'HDMI, USB-C, DisplayPort & more',        '🧵', 14)
) AS v(name, slug, description, icon, sort_order)
JOIN categories c ON c.slug = 'storage-accessories';

-- ── 10. Gadgets & Electronics subcategories ──────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, parent_id)
SELECT v.name, v.slug, v.description, v.icon, v.sort_order, c.id
FROM (VALUES
  ('Smart Watches',       'smart-watches',       'Apple Watch, Galaxy Watch & more',        '⌚', 1),
  ('Wireless Earbuds',    'wireless-earbuds',    'TWS earbuds with ANC & long battery',     '🎵', 2),
  ('Bluetooth Speakers',  'bluetooth-speakers',  'Portable party & outdoor speakers',       '🔊', 3),
  ('Power Banks',         'power-banks',         'Fast-charging portable battery packs',    '🔋', 4),
  ('Chargers',            'chargers',            'GaN, USB-C & wireless chargers',          '⚡', 5),
  ('Smart Accessories',   'smart-accessories',   'Smart home & lifestyle gadgets',          '🏠', 6),
  ('Gaming Accessories',  'gaming-accessories',  'Controllers, headsets & gear',            '🕹️', 7),
  ('Networking Devices',  'networking-devices',  'Routers, extenders & switches',           '📡', 8),
  ('USB Gadgets',         'usb-gadgets',         'Cool & useful USB-powered gadgets',       '🧩', 9),
  ('Tech Gadgets',        'tech-gadgets',        'Latest trending tech & innovations',      '🚁', 10),
  ('Mobile Accessories',  'mobile-accessories',  'Cases, mounts, cables & more',            '📱', 11)
) AS v(name, slug, description, icon, sort_order)
JOIN categories c ON c.slug = 'gadgets-electronics';

-- ============================================================
-- SEED PRODUCTS (60)
-- ============================================================
INSERT INTO products (
  name, slug, description, brand, category,
  condition_type, condition_grade, price, compare_at_price,
  images, thumbnail_url, specs, battery_health, warranty,
  stock_qty, is_featured
) VALUES

-- ── LAPTOPS: Business (used) ─────────────────────────────────
(
  'Dell Latitude 7420', 'dell-latitude-7420-i7-16gb-512gb',
  'Premium business ultrabook with 11th Gen Intel Core i7, 16 GB RAM and 512 GB NVMe SSD. Perfect for professionals who need reliability and performance on the go.',
  'Dell', 'business-laptops', 'used', 'Excellent', 185000, 220000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800","https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i7-1185G7","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"14\" FHD IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '92%', '7-day checking warranty', 3, true
),
(
  'HP EliteBook 840 G8', 'hp-elitebook-840-g8-i5-16gb-256gb',
  'Sleek and powerful HP EliteBook with 11th Gen Core i5. Ideal for office work, multitasking and everyday productivity.',
  'HP', 'business-laptops', 'used', 'Good', 155000, 180000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"Intel Core i5-1135G7","ram":"16GB DDR4","storage":"256GB NVMe SSD","display":"14\" FHD IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '85%', '7-day checking warranty', 5, true
),
(
  'Lenovo ThinkPad T14 Gen 2', 'lenovo-thinkpad-t14-gen2-ryzen5-16gb-256gb',
  'Durable business laptop with AMD Ryzen 5 Pro and excellent keyboard. Built to last with military-grade reliability.',
  'Lenovo', 'business-laptops', 'used', 'Good', 140000, 165000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"AMD Ryzen 5 PRO 5650U","ram":"16GB DDR4","storage":"256GB NVMe SSD","display":"14\" FHD IPS","graphics":"AMD Radeon","os":"Windows 11 Pro"}',
  '83%', '7-day checking warranty', 6, false
),
(
  'HP ZBook Firefly 15 G8', 'hp-zbook-firefly-15-g8-i7-t500-16gb-512gb',
  'Mobile workstation with ISV-certified NVIDIA T500 graphics. Perfect for AutoCAD, SolidWorks and 3D rendering.',
  'HP', 'business-laptops', 'used', 'Excellent', 285000, 340000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"Intel Core i7-1165G7","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD IPS","graphics":"NVIDIA T500 4GB","os":"Windows 11 Pro"}',
  '90%', '15-day checking warranty', 2, false
),

-- ── LAPTOPS: Ultrabooks / 2-in-1 ─────────────────────────────
(
  'Lenovo ThinkPad X1 Carbon Gen 9', 'lenovo-thinkpad-x1-carbon-gen9-i7-16gb-512gb',
  'The legendary ThinkPad X1 Carbon , ultra-light, ultra-powerful. 11th Gen i7 with stunning 14-inch 2K display.',
  'Lenovo', 'ultrabooks', 'used', 'Like New', 245000, 290000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"Intel Core i7-1165G7","ram":"16GB LPDDR4X","storage":"512GB NVMe SSD","display":"14\" 2K IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '96%', '15-day checking warranty', 2, true
),
(
  'Dell XPS 15 9520', 'dell-xps-15-9520-i7-32gb-1tb-rtx3050',
  'Stunning creator laptop with 12th Gen i7, 32GB RAM, RTX 3050 and gorgeous 15.6" 4K OLED display.',
  'Dell', 'ultrabooks', 'used', 'Like New', 385000, 450000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i7-12700H","ram":"32GB DDR5","storage":"1TB NVMe SSD","display":"15.6\" 4K OLED","graphics":"NVIDIA RTX 3050 4GB","os":"Windows 11 Pro"}',
  '97%', '15-day checking warranty', 1, true
),
(
  'HP Spectre x360 14', 'hp-spectre-x360-14-i7-16gb-512gb',
  'Premium convertible with gem-cut design, 11th Gen i7 and a gorgeous 13.5" touchscreen with stylus support.',
  'HP', '2-in-1-convertibles', 'used', 'Excellent', 235000, 275000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"Intel Core i7-1165G7","ram":"16GB LPDDR4X","storage":"512GB NVMe SSD","display":"13.5\" WUXGA Touch","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '89%', '15-day checking warranty', 2, false
),
(
  'Lenovo Yoga 9i 14', 'lenovo-yoga-9i-i7-16gb-1tb',
  'Refurbished flagship convertible with rotating soundbar hinge, 11th Gen i7 and 4K OLED touch display.',
  'Lenovo', '2-in-1-convertibles', 'refurbished', 'Like New', 265000, 310000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"Intel Core i7-1185G7","ram":"16GB LPDDR4X","storage":"1TB NVMe SSD","display":"14\" 4K OLED Touch","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '93%', '30-day replacement warranty', 1, false
),

-- ── LAPTOPS: Gaming ──────────────────────────────────────────
(
  'ASUS ROG Strix G15', 'asus-rog-strix-g15-ryzen7-rtx3060-16gb',
  'Gaming beast with AMD Ryzen 7 6800H and NVIDIA RTX 3060. 144Hz display for buttery-smooth gameplay.',
  'ASUS', 'gaming-laptops', 'used', 'Excellent', 295000, 350000,
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  '{"processor":"AMD Ryzen 7 6800H","ram":"16GB DDR5","storage":"512GB NVMe SSD","display":"15.6\" FHD 144Hz","graphics":"NVIDIA RTX 3060 6GB","os":"Windows 11 Home"}',
  '88%', '7-day checking warranty', 1, true
),
(
  'MSI GF63 Thin', 'msi-gf63-thin-i5-rtx3050-8gb-512gb',
  'Entry-level gaming laptop with Intel Core i5 and RTX 3050. Great value for aspiring gamers.',
  'MSI', 'gaming-laptops', 'used', 'Good', 175000, 210000,
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800","https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  '{"processor":"Intel Core i5-11400H","ram":"8GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD 144Hz","graphics":"NVIDIA RTX 3050 4GB","os":"Windows 11 Home"}',
  '78%', '7-day checking warranty', 3, false
),

-- ── LAPTOPS: MacBooks ────────────────────────────────────────
(
  'MacBook Air M1 2020', 'macbook-air-m1-2020-8gb-256gb',
  'Apple MacBook Air with M1 chip , incredible performance and battery life. Perfect for students and creators.',
  'Apple', 'macbooks', 'used', 'Excellent', 225000, 260000,
  '["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"]',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
  '{"processor":"Apple M1","ram":"8GB Unified","storage":"256GB SSD","display":"13.3\" Retina","graphics":"Apple M1 GPU","os":"macOS Sonoma"}',
  '94%', '15-day checking warranty', 4, true
),
(
  'MacBook Pro 14 M1 Pro', 'macbook-pro-14-m1-pro-16gb-512gb',
  'The creative powerhouse. M1 Pro chip with 16GB RAM, stunning Liquid Retina XDR display and all-day battery.',
  'Apple', 'macbooks', 'used', 'Excellent', 425000, 475000,
  '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800","https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]',
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
  '{"processor":"Apple M1 Pro","ram":"16GB Unified","storage":"512GB SSD","display":"14.2\" Liquid Retina XDR","graphics":"M1 Pro 14-core GPU","os":"macOS Sonoma"}',
  '91%', '15-day checking warranty', 2, true
),
(
  'MacBook Air M2 2022', 'macbook-air-m2-2022-8gb-256gb',
  'Refurbished MacBook Air M2 with redesigned look, bigger 13.6" Liquid Retina display and MagSafe charging.',
  'Apple', 'macbooks', 'refurbished', 'Like New', 335000, 380000,
  '["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
  '{"processor":"Apple M2","ram":"8GB Unified","storage":"256GB SSD","display":"13.6\" Liquid Retina","graphics":"Apple M2 GPU","os":"macOS Sonoma"}',
  '98%', '30-day replacement warranty', 3, false
),

-- ── LAPTOPS: New ─────────────────────────────────────────────
(
  'Dell Inspiron 15 3520', 'dell-inspiron-15-3520-i5-12gb-512gb',
  'Brand new Dell Inspiron 15 with 12th Gen Core i5, 12GB RAM and 512GB SSD. Sealed box with official warranty.',
  'Dell', 'laptops-new', 'new', 'New', 165000, 189000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i5-1235U","ram":"12GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD 120Hz","graphics":"Intel Iris Xe","os":"Windows 11 Home"}',
  NULL, '1-year Dell official warranty', 5, true
),
(
  'HP Victus 16', 'hp-victus-16-i5-rtx3050-16gb',
  'Brand new HP Victus 16 gaming laptop with RTX 3050, 16GB RAM and 144Hz display. Sealed box.',
  'HP', 'laptops-new', 'new', 'New', 305000, 345000,
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800"]',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  '{"processor":"Intel Core i5-12450H","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"16.1\" FHD 144Hz","graphics":"NVIDIA RTX 3050 4GB","os":"Windows 11 Home"}',
  NULL, '1-year HP official warranty', 4, false
),
(
  'Acer Aspire 5', 'acer-aspire-5-ryzen5-16gb-512gb',
  'Brand new Acer Aspire 5 with Ryzen 5, 16GB RAM , the best value new laptop for work and study.',
  'Acer', 'laptops-new', 'new', 'New', 145000, 165000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"AMD Ryzen 5 5625U","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD IPS","graphics":"AMD Radeon","os":"Windows 11 Home"}',
  NULL, '1-year Acer official warranty', 6, false
),

-- ── LAPTOPS: Refurbished / Student ───────────────────────────
(
  'Dell Latitude 5420', 'dell-latitude-5420-refurb-i5-16gb-256gb',
  'Professionally refurbished Dell Latitude 5420 , fully tested, cleaned and reset with fresh Windows 11.',
  'Dell', 'laptops-refurbished', 'refurbished', 'Excellent', 125000, 150000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i5-1145G7","ram":"16GB DDR4","storage":"256GB NVMe SSD","display":"14\" FHD IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  '87%', '30-day replacement warranty', 4, false
),
(
  'HP ProBook 450 G8', 'hp-probook-450-g8-i5-8gb-256gb',
  'Affordable workhorse for students and small businesses. 11th Gen Core i5 with solid build quality.',
  'HP', 'student-laptops', 'used', 'Good', 110000, 130000,
  '["https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800","https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800"]',
  'https://images.unsplash.com/photo-1496181664578-3103372bf986?w=400',
  '{"processor":"Intel Core i5-1135G7","ram":"8GB DDR4","storage":"256GB NVMe SSD","display":"15.6\" FHD","graphics":"Intel Iris Xe","os":"Windows 11 Home"}',
  '80%', '7-day checking warranty', 8, false
),
(
  'HP 250 G8', 'hp-250-g8-i3-8gb-256gb-new',
  'Brand new budget-friendly HP 250 G8 , perfect first laptop for students with official warranty.',
  'HP', 'student-laptops', 'new', 'New', 95000, 110000,
  '["https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1496181664578-3103372bf986?w=400',
  '{"processor":"Intel Core i3-1005G1","ram":"8GB DDR4","storage":"256GB SSD","display":"15.6\" FHD","graphics":"Intel UHD","os":"Windows 11 Home"}',
  NULL, '1-year HP official warranty', 7, false
),
(
  'Lenovo IdeaPad Slim 3', 'lenovo-ideapad-slim-3-ryzen5-8gb-512gb-new',
  'Brand new IdeaPad Slim 3 with Ryzen 5 and 512GB SSD , slim, light and great for everyday study.',
  'Lenovo', 'student-laptops', 'new', 'New', 118000, 135000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"AMD Ryzen 5 5500U","ram":"8GB DDR4","storage":"512GB SSD","display":"15.6\" FHD","graphics":"AMD Radeon","os":"Windows 11 Home"}',
  NULL, '1-year Lenovo official warranty', 6, false
),

-- ── PCs & DESKTOPS ───────────────────────────────────────────
(
  'Custom Gaming PC RTX 4060', 'custom-gaming-pc-rtx4060-i5-16gb-1tb',
  'Hand-built gaming PC with Intel Core i5-13400F, RTX 4060, 16GB DDR5 and 1TB NVMe. Runs every AAA title at 1080p ultra.',
  'ElectroGhar Builds', 'gaming-pcs', 'new', 'New', 385000, 430000,
  '["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800"]',
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  '{"processor":"Intel Core i5-13400F","ram":"16GB DDR5","storage":"1TB NVMe SSD","graphics":"NVIDIA RTX 4060 8GB","cooling":"RGB Air Cooling","psu":"650W 80+ Bronze"}',
  NULL, '1-year parts warranty', 3, true
),
(
  'Custom Gaming PC RTX 3060', 'custom-gaming-pc-rtx3060-i5-16gb-512gb',
  'Value gaming build with i5-12400F and RTX 3060 12GB , smooth 1080p/1440p gaming on a budget.',
  'ElectroGhar Builds', 'gaming-pcs', 'new', 'New', 265000, 295000,
  '["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800"]',
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  '{"processor":"Intel Core i5-12400F","ram":"16GB DDR4","storage":"512GB NVMe SSD","graphics":"NVIDIA RTX 3060 12GB","cooling":"4x RGB Fans","psu":"600W 80+ Bronze"}',
  NULL, '1-year parts warranty', 2, false
),
(
  'Dell OptiPlex 7080 SFF', 'dell-optiplex-7080-sff-i5-16gb-256gb',
  'Compact small-form-factor business desktop with 10th Gen i5. Perfect for office work and browsing.',
  'Dell', 'used-pcs', 'used', 'Good', 65000, 80000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i5-10500","ram":"16GB DDR4","storage":"256GB NVMe SSD","graphics":"Intel UHD 630","form":"Small Form Factor","ports":"6x USB, DP, HDMI"}',
  NULL, '7-day checking warranty', 5, false
),
(
  'HP EliteDesk 800 G6', 'hp-elitedesk-800-g6-i7-16gb-512gb',
  'Refurbished enterprise-grade desktop with 10th Gen i7, 16GB RAM and dual storage. Rock solid reliability.',
  'HP', 'business-pcs', 'refurbished', 'Excellent', 95000, 115000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i7-10700","ram":"16GB DDR4","storage":"512GB NVMe SSD","graphics":"Intel UHD 630","form":"Mini Tower","ports":"10x USB, 2x DP, VGA"}',
  NULL, '30-day replacement warranty', 4, false
),
(
  'Lenovo ThinkCentre M720q', 'lenovo-thinkcentre-m720q-i5-8gb-256gb',
  'Tiny mini PC that mounts behind your monitor. i5-8400T with 8GB RAM , great for offices and studios.',
  'Lenovo', 'mini-pcs', 'refurbished', 'Excellent', 55000, 70000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i5-8400T","ram":"8GB DDR4","storage":"256GB NVMe SSD","graphics":"Intel UHD 630","form":"1L Tiny PC","ports":"5x USB, DP, HDMI, LAN"}',
  NULL, '30-day replacement warranty', 6, false
),
(
  'Intel NUC 12 Pro', 'intel-nuc-12-pro-i5-16gb-512gb',
  'Brand new palm-sized Intel NUC with 12th Gen i5, Thunderbolt 4 and Wi-Fi 6. The ultimate compact desktop.',
  'Intel', 'mini-pcs', 'new', 'New', 85000, 95000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i5-1240P","ram":"16GB DDR4","storage":"512GB NVMe SSD","graphics":"Intel Iris Xe","form":"NUC 12","ports":"2x Thunderbolt 4, HDMI, LAN"}',
  NULL, '1-year Intel official warranty', 3, false
),
(
  'Apple iMac 24" M1', 'apple-imac-24-m1-8gb-256gb',
  'Used iMac 24" with M1 chip in beautiful blue , 4.5K Retina display, magic keyboard and mouse included.',
  'Apple', 'all-in-one-pcs', 'used', 'Excellent', 325000, 385000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Apple M1","ram":"8GB Unified","storage":"256GB SSD","display":"24\" 4.5K Retina","graphics":"Apple M1 GPU","os":"macOS Sonoma"}',
  NULL, '15-day checking warranty', 2, true
),
(
  'HP ProDesk 400 G7', 'hp-prodesk-400-g7-i5-8gb-1tb',
  'Refurbished HP ProDesk with 10th Gen i5, 8GB RAM and 1TB storage. Reliable everyday desktop for home or office.',
  'HP', 'desktop-pcs', 'refurbished', 'Good', 72000, 88000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i5-10400","ram":"8GB DDR4","storage":"1TB HDD","graphics":"Intel UHD 630","form":"Micro Tower","ports":"8x USB, DP, VGA"}',
  NULL, '30-day replacement warranty', 5, false
),
(
  'Dell Precision 3640 Workstation', 'dell-precision-3640-i7-32gb-rtxa2000',
  'Certified workstation with 10th Gen i7, 32GB ECC RAM and NVIDIA RTX A2000 , built for SolidWorks, Revit and Blender.',
  'Dell', 'workstations', 'used', 'Good', 245000, 290000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"processor":"Intel Core i7-10700K","ram":"32GB DDR4 ECC","storage":"512GB NVMe + 1TB HDD","graphics":"NVIDIA RTX A2000 6GB","psu":"500W 80+ Gold","os":"Windows 11 Pro"}',
  NULL, '15-day checking warranty', 2, false
),
(
  'Threadripper Custom Workstation', 'threadripper-workstation-5955wx-128gb-rtx4080',
  'Dream build for 3D artists: Ryzen Threadripper PRO 5955WX, 128GB RAM, RTX 4080 and 4TB NVMe. Built & stress-tested by us.',
  'ElectroGhar Builds', 'custom-pc-builds', 'new', 'New', 650000, 720000,
  '["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800"]',
  'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
  '{"processor":"Ryzen Threadripper PRO 5955WX","ram":"128GB DDR4 ECC","storage":"4TB NVMe SSD","graphics":"NVIDIA RTX 4080 16GB","cooling":"360mm AIO Liquid","psu":"1000W 80+ Platinum"}',
  NULL, '2-year parts warranty', 1, false
),

-- ── MONITORS ─────────────────────────────────────────────────
(
  'Dell S2421HN 24" LED', 'dell-s2421hn-24-led-ips',
  'Brand new 24" Full HD IPS monitor with slim bezels , perfect for office and study setups.',
  'Dell', 'led-monitors', 'new', 'New', 42000, 49000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"24\"","resolution":"1920x1080 FHD","panel":"IPS 75Hz","ports":"2x HDMI","features":"AMD FreeSync"}',
  NULL, '3-year Dell official warranty', 8, false
),
(
  'LG 24MK430H', 'lg-24mk430h-24-ips-75hz',
  'Brand new LG 24" IPS monitor with Radeon FreeSync , smooth visuals at an affordable price.',
  'LG', 'led-monitors', 'new', 'New', 38000, 45000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"24\"","resolution":"1920x1080 FHD","panel":"IPS 75Hz","ports":"HDMI, VGA","features":"FreeSync"}',
  NULL, '3-year LG official warranty', 6, false
),
(
  'Acer Nitro XV272 144Hz', 'acer-nitro-xv272-27-144hz-ips',
  'Brand new 27" gaming monitor with 144Hz IPS panel and 1ms response , competitive edge unlocked.',
  'Acer', 'gaming-monitors', 'new', 'New', 105000, 125000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"27\"","resolution":"1920x1080 FHD","panel":"IPS 144Hz","response":"1ms","ports":"2x HDMI, DP","features":"FreeSync Premium"}',
  NULL, '3-year Acer official warranty', 4, true
),
(
  'Samsung Odyssey G5 32" Curved', 'samsung-odyssey-g5-32-curved-144hz',
  'Brand new 32" 1440p curved gaming monitor with 165Hz , total immersion for racing and RPG games.',
  'Samsung', 'curved-monitors', 'new', 'New', 145000, 170000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"32\"","resolution":"2560x1440 QHD","panel":"VA 165Hz Curved","response":"1ms","ports":"2x HDMI, DP","features":"FreeSync Premium"}',
  NULL, '3-year Samsung official warranty', 3, false
),
(
  'LG 29WP500 Ultrawide', 'lg-29wp500-29-ultrawide-ips',
  'Brand new 29" WFHD ultrawide IPS monitor , extra screen real estate for multitasking and editing.',
  'LG', 'ultrawide-monitors', 'new', 'New', 98000, 115000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"29\"","resolution":"2560x1080 WFHD","panel":"IPS 75Hz Ultrawide","ports":"2x HDMI","features":"FreeSync"}',
  NULL, '3-year LG official warranty', 4, false
),
(
  'Dell UltraSharp U2720Q 4K', 'dell-ultrasharp-u2720q-27-4k-usb-c',
  'Brand new 27" 4K IPS monitor with USB-C 90W power delivery , the creator and professional choice.',
  'Dell', '4k-monitors', 'new', 'New', 165000, 195000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"27\"","resolution":"3840x2160 4K","panel":"IPS 60Hz","ports":"HDMI, DP, USB-C 90W","features":"99% sRGB"}',
  NULL, '3-year Dell official warranty', 2, false
),
(
  'Dell P2419H Used', 'dell-p2419h-24-used-ips',
  'Used Dell P2419H 24" business IPS monitor in excellent condition , fully tested with all cables.',
  'Dell', 'used-monitors', 'used', 'Good', 28000, 35000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"24\"","resolution":"1920x1080 FHD","panel":"IPS 60Hz","ports":"DP, HDMI, VGA","features":"Height adjustable stand"}',
  NULL, '7-day checking warranty', 9, false
),

-- ── STORAGE & ACCESSORIES ────────────────────────────────────
(
  'Samsung T7 1TB External SSD', 'samsung-t7-1tb-external-ssd',
  'Brand new Samsung T7 portable SSD , 1050MB/s read speed in a pocket-sized palm design.',
  'Samsung', 'external-ssds', 'new', 'New', 28000, 32000,
  '[]', NULL,
  '{"capacity":"1TB","speed":"1050MB/s Read","interface":"USB 3.2 Gen 2","features":"Shock resistant"}',
  NULL, '3-year Samsung official warranty', 10, true
),
(
  'WD My Passport 2TB', 'wd-my-passport-2tb-external-hdd',
  'Brand new 2TB portable hard drive with hardware encryption and automatic backup software.',
  'Western Digital', 'external-hard-drives', 'new', 'New', 18500, 22000,
  '[]', NULL,
  '{"capacity":"2TB","speed":"USB 3.0","features":"Hardware encryption, Auto backup"}',
  NULL, '3-year WD official warranty', 12, false
),
(
  'Samsung 980 Pro 1TB NVMe', 'samsung-980-pro-1tb-nvme-gen4',
  'Brand new PCIe Gen4 NVMe SSD with 7000MB/s reads , transform your laptop or desktop performance.',
  'Samsung', 'internal-ssds', 'new', 'New', 35000, 41000,
  '[]', NULL,
  '{"capacity":"1TB","speed":"7000MB/s Read","interface":"PCIe Gen 4.0 x4","form":"M.2 2280"}',
  NULL, '5-year Samsung official warranty', 8, false
),
(
  'Kingston Fury Beast 16GB DDR4', 'kingston-fury-beast-16gb-ddr4-3200',
  'Brand new 16GB (2x8GB) DDR4 3200MHz kit with sleek heat spreader , easy performance boost.',
  'Kingston', 'ram', 'new', 'New', 12500, 15000,
  '[]', NULL,
  '{"capacity":"16GB (2x8GB)","type":"DDR4","speed":"3200MHz","latency":"CL16"}',
  NULL, 'Lifetime Kingston warranty', 15, false
),
(
  'Corsair Vengeance 32GB DDR4', 'corsair-vengeance-32gb-ddr4-3600',
  'Brand new 32GB (2x16GB) DDR4 3600MHz kit for creators and power users.',
  'Corsair', 'ram', 'new', 'New', 24000, 28000,
  '[]', NULL,
  '{"capacity":"32GB (2x16GB)","type":"DDR4","speed":"3600MHz","latency":"CL18"}',
  NULL, 'Lifetime Corsair warranty', 6, false
),
(
  'SanDisk Ultra 128GB Dual USB', 'sandisk-ultra-128gb-dual-usb-c',
  'Brand new 128GB dual drive with USB-C and USB-A , move files between phone and laptop instantly.',
  'SanDisk', 'usb-flash-drives', 'new', 'New', 3200, 3900,
  '[]', NULL,
  '{"capacity":"128GB","interface":"USB 3.0 + USB-C","speed":"150MB/s"}',
  NULL, '5-year SanDisk warranty', 25, false
),
(
  'Logitech MX Master 3S', 'logitech-mx-master-3s-wireless-mouse',
  'Brand new MX Master 3S , the legendary productivity mouse with 8K DPI sensor and quiet clicks.',
  'Logitech', 'mice', 'new', 'New', 22500, 26000,
  '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  '{"sensor":"8000 DPI","buttons":"7 programmable","connectivity":"Bluetooth + USB dongle","battery":"70 days"}',
  NULL, '1-year Logitech warranty', 9, true
),
(
  'Logitech MX Keys S', 'logitech-mx-keys-s-wireless-keyboard',
  'Brand new MX Keys S with smart backlight, low-profile keys and multi-device switching.',
  'Logitech', 'keyboards', 'new', 'New', 21000, 24500,
  '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"]',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  '{"layout":"Full size","backlight":"Smart RGB","connectivity":"Bluetooth + USB dongle","battery":"10 days"}',
  NULL, '1-year Logitech warranty', 7, false
),
(
  'Redragon Kumara K552', 'redragon-kumara-k552-mechanical-keyboard',
  'Brand new mechanical keyboard with red switches, rainbow backlight and aircraft-grade aluminum build.',
  'Redragon', 'keyboards', 'new', 'New', 8500, 10500,
  '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"]',
  'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
  '{"layout":"TKL (87 keys)","switches":"Red linear","backlight":"Rainbow","keycaps":"Double-shot"}',
  NULL, '1-year Redragon warranty', 14, false
),
(
  'Anker 7-in-1 USB-C Hub', 'anker-7-in-1-usb-c-hub',
  'Brand new USB-C hub with 4K HDMI, 100W passthrough and SD card reader , laptop essential.',
  'Anker', 'usb-hubs', 'new', 'New', 9500, 11500,
  '[]', NULL,
  '{"ports":"USB-C PD 100W, HDMI 4K, 2x USB 3.0, SD, microSD","material":"Aluminum"}',
  NULL, '18-month Anker warranty', 11, false
),
(
  'Dell 65W USB-C Charger', 'dell-65w-usb-c-laptop-charger',
  'Genuine Dell 65W USB-C adapter , compatible with Latitude, XPS, Inspiron and other USB-C laptops.',
  'Dell', 'laptop-chargers', 'new', 'New', 5500, 7000,
  '[]', NULL,
  '{"power":"65W","connector":"USB-C","compatibility":"Latitude, XPS, Inspiron"}',
  NULL, '6-month replacement warranty', 18, false
),
(
  'HP 15.6" Laptop Backpack', 'hp-156-laptop-backpack-water-resistant',
  'Brand new water-resistant backpack with padded 15.6" laptop compartment and USB charging port.',
  'HP', 'laptop-bags', 'new', 'New', 4500, 5900,
  '[]', NULL,
  '{"laptop_size":"Up to 15.6\"","material":"Water-resistant polyester","features":"USB port, anti-theft pocket"}',
  NULL, '6-month replacement warranty', 20, false
),
(
  'Logitech C920 HD Pro Webcam', 'logitech-c920-hd-pro-webcam',
  'Brand new C920 , the streaming standard with 1080p30, auto-focus and stereo mics.',
  'Logitech', 'webcams', 'new', 'New', 18000, 21000,
  '[]', NULL,
  '{"video":"1080p 30fps","microphone":"Dual stereo","focus":"Autofocus","mount":"Clip + tripod ready"}',
  NULL, '2-year Logitech warranty', 8, false
),

-- ── GADGETS & ELECTRONICS ────────────────────────────────────
(
  'Apple Watch SE 2', 'apple-watch-se-2-44mm-gps',
  'Used Apple Watch SE 2 44mm GPS with extra bands included , crash detection and sleep tracking.',
  'Apple', 'smart-watches', 'used', 'Excellent', 55000, 68000,
  '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  '{"case":"44mm Aluminum","water":"50m WR","sensors":"Heart rate, Fall, Crash detect","battery":"18 hours"}',
  '95%', '7-day checking warranty', 3, false
),
(
  'Samsung Galaxy Watch 6', 'samsung-galaxy-watch-6-44mm-bt',
  'Brand new Galaxy Watch 6 44mm with body composition analysis and improved sleep coaching.',
  'Samsung', 'smart-watches', 'new', 'New', 75000, 89000,
  '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"]',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  '{"case":"44mm","display":"1.5\" AMOLED","sensors":"BioActive, HR, ECG","battery":"40 hours"}',
  NULL, '1-year Samsung official warranty', 4, false
),
(
  'AirPods Pro 2', 'airpods-pro-2-usb-c',
  'Brand new AirPods Pro 2 with USB-C , 2x Active Noise Cancellation and Adaptive Audio.',
  'Apple', 'wireless-earbuds', 'new', 'New', 62000, 72000,
  '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  '{"chip":"H2","anc":"2x Active Noise Cancellation","battery":"6h + 30h case","water":"IP54"}',
  NULL, '1-year Apple official warranty', 10, true
),
(
  'Soundcore Life P2', 'soundcore-life-p2-tws-earbuds',
  'Brand new budget wireless earbuds with graphene drivers, IPX7 and 40h total battery.',
  'Anker', 'wireless-earbuds', 'new', 'New', 12500, 15000,
  '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"]',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
  '{"drivers":"Graphene 6mm","battery":"7h + 33h case","water":"IPX7","bluetooth":"5.0"}',
  NULL, '18-month Anker warranty', 15, false
),
(
  'JBL Flip 6', 'jbl-flip-6-bluetooth-speaker',
  'Brand new JBL Flip 6 , big bass in a waterproof tube with 12 hours of playtime.',
  'JBL', 'bluetooth-speakers', 'new', 'New', 32000, 38000,
  '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800"]',
  'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
  '{"power":"30W","battery":"12 hours","water":"IP67","features":"PartyBoost pairing"}',
  NULL, '1-year JBL warranty', 8, false
),
(
  'Anker PowerCore 20000mAh', 'anker-powercore-20000mah-power-bank',
  'Brand new 20000mAh power bank with 22.5W fast charging and USB-C PD.',
  'Anker', 'power-banks', 'new', 'New', 11500, 14000,
  '[]', NULL,
  '{"capacity":"20000mAh","output":"22.5W fast charge","ports":"USB-C PD, 2x USB-A"}',
  NULL, '18-month Anker warranty', 16, false
),
(
  'Anker 65W GaN Charger', 'anker-65w-gan-usb-c-charger',
  'Brand new GaN II fast charger , charges laptop, tablet and phone from one compact brick.',
  'Anker', 'chargers', 'new', 'New', 8500, 10500,
  '[]', NULL,
  '{"power":"65W total","ports":"2x USB-C, 1x USB-A","tech":"GaN II"}',
  NULL, '18-month Anker warranty', 20, false
),
(
  'TP-Link Archer AX55 Router', 'tp-link-archer-ax55-wifi6-router',
  'Brand new Wi-Fi 6 router with 2402Mbps speeds, OFDMA and improved coverage for home offices.',
  'TP-Link', 'networking-devices', 'new', 'New', 18000, 21500,
  '[]', NULL,
  '{"wifi":"Wi-Fi 6 AX3000","speed":"2402Mbps","ports":"4x Gigabit LAN","features":"OFDMA, MU-MIMO"}',
  NULL, '2-year TP-Link warranty', 7, false
),
(
  'Razer DeathAdder V2', 'razer-deathadderv2-gaming-mouse',
  'Brand new esports legend , 20K DPI optical sensor, 5G durable switches and Speedflex cable.',
  'Razer', 'gaming-accessories', 'new', 'New', 12500, 15000,
  '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  '{"sensor":"20000 DPI Optical","buttons":"8 programmable","weight":"82g","switches":"5G Optical"}',
  NULL, '2-year Razer warranty', 9, false
),
(
  'Xiaomi 10000mAh Slim', 'xiaomi-10000mah-slim-power-bank',
  'Brand new ultra-slim 10000mAh power bank with 22.5W fast charge , pocketable backup power.',
  'Xiaomi', 'power-banks', 'new', 'New', 5500, 6800,
  '[]', NULL,
  '{"capacity":"10000mAh","output":"22.5W fast charge","ports":"USB-C, USB-A","thickness":"15mm"}',
  NULL, '6-month Xiaomi warranty', 22, false
);

-- ── FILLER: products for remaining empty categories ────────────
INSERT INTO products (
  name, slug, description, brand, category,
  condition_type, condition_grade, price, compare_at_price,
  images, thumbnail_url, specs, battery_health, warranty,
  stock_qty, is_featured
) VALUES
(
  'Seagate Barracuda 2TB Internal HDD', 'seagate-barracuda-2tb-internal-hdd',
  'Brand new 2TB 7200RPM internal hard drive , reliable bulk storage for desktops and backups.',
  'Seagate', 'hdds', 'new', 'New', 11500, 13500,
  '[]', NULL,
  '{"capacity":"2TB","speed":"7200 RPM","cache":"256MB","interface":"SATA 6Gb/s"}',
  NULL, '2-year Seagate warranty', 14, false
),
(
  'UGREEN HDMI 2.1 Cable 2m', 'ugreen-hdmi-21-cable-2m',
  'Brand new 8K HDMI 2.1 braided cable , 48Gbps bandwidth for gaming monitors, consoles and GPUs.',
  'UGREEN', 'adapters-cables', 'new', 'New', 3200, 3900,
  '[]', NULL,
  '{"version":"HDMI 2.1","length":"2m","bandwidth":"48Gbps","support":"8K@60Hz, 4K@120Hz"}',
  NULL, '18-month UGREEN warranty', 25, false
),
(
  'Anker USB-C to USB-C 100W Cable', 'anker-usb-c-to-usb-c-100w-cable',
  'Brand new braided 100W USB-C cable , charges laptops, phones and tablets at full speed.',
  'Anker', 'adapters-cables', 'new', 'New', 2800, 3400,
  '[]', NULL,
  '{"power":"100W PD","length":"1.8m","build":"Braided nylon","connector":"USB-C to USB-C"}',
  NULL, '18-month Anker warranty', 30, false
),
(
  'SanDisk Ultra 128GB microSDXC', 'sandisk-ultra-128gb-microsdxc',
  'Brand new 128GB microSD card with 120MB/s reads , ideal for phones, cameras and dash cams.',
  'SanDisk', 'memory-cards', 'new', 'New', 3800, 4500,
  '[]', NULL,
  '{"capacity":"128GB","speed":"120MB/s read","standard":"UHS-I, A1","format":"microSDXC"}',
  NULL, '10-year limited warranty', 20, false
),
(
  'Xiaomi Smart Band 8', 'xiaomi-smart-band-8',
  'Brand new Xiaomi Smart Band 8 , 1.62-inch AMOLED display, 16-day battery and 150+ sport modes.',
  'Xiaomi', 'smart-accessories', 'new', 'New', 9500, 11500,
  '[]', NULL,
  '{"display":"1.62\" AMOLED","battery":"16 days","water":"5ATM","sensors":"HR, SpO2"}',
  NULL, '1-year Xiaomi warranty', 11, false
),
(
  'Dell E1919H 18.5" LCD', 'dell-e1919h-18-5-lcd-used',
  'Tested used Dell 18.5-inch LCD monitor , a budget-friendly second screen for desks and POS setups.',
  'Dell', 'lcd-monitors', 'used', 'Good', 11000, 14000,
  '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
  '{"size":"18.5\"","resolution":"1366x768 HD","panel":"TN LED","ports":"VGA"}',
  NULL, '7-day checking warranty', 4, false
),
(
  'Redragon XXL Gaming Mousepad', 'redragon-xxl-gaming-mousepad',
  'Brand new 900x400mm oversized mousepad , covers keyboard and mouse with smooth, stitched edges.',
  'Redragon', 'pc-accessories', 'new', 'New', 1800, 2300,
  '["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800"]',
  'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
  '{"size":"900 x 400mm","thickness":"4mm","surface":"Smooth cloth","edge":"Stitched"}',
  NULL, '6-month Redragon warranty', 18, false
),
(
  'Anker PowerLine II USB-C to Lightning', 'anker-powerline-ii-usb-c-lightning',
  'Brand new MFi-certified braided Lightning cable , built to survive 25,000+ bends.',
  'Anker', 'mobile-accessories', 'new', 'New', 2500, 3000,
  '[]', NULL,
  '{"certified":"MFi","length":"0.9m","build":"Braided","durability":"25,000+ bends"}',
  NULL, 'Lifetime Anker warranty', 22, false
);
