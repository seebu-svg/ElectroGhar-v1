-- ============================================================
-- ElectroGhar — Full Database Setup (copy-paste into SQL Editor)
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Categories Table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Products Table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT,
  brand            TEXT NOT NULL,
  category         TEXT NOT NULL REFERENCES categories(slug),
  price            NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  currency         TEXT DEFAULT 'PKR',
  images           JSONB DEFAULT '[]'::jsonb,
  thumbnail_url    TEXT,
  specs            JSONB DEFAULT '{}'::jsonb,
  condition_grade  TEXT DEFAULT 'Good'
                   CHECK (condition_grade IN ('Like New', 'Excellent', 'Good', 'Fair')),
  battery_health   TEXT,
  warranty         TEXT,
  stock_qty        INT DEFAULT 1,
  is_available     BOOLEAN DEFAULT true,
  is_featured      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  meta_title       TEXT,
  meta_description TEXT,
  whatsapp_number  TEXT DEFAULT '+92339244435',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active)   WHERE is_active  = true;
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_condition   ON products(condition_grade);

-- ── 4. Auto-update trigger ───────────────────────────────────
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

-- ── 5. Row-Level Security ────────────────────────────────────
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read (anonymous users can view active items)
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admin write policies (authenticated = admin only)
CREATE POLICY "Admin insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Admin insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- ── 6. Seed Categories ───────────────────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Business Laptops',    'business-laptops',    'Reliable workhorses for professionals',   '💼', 1),
  ('Gaming Laptops',      'gaming-laptops',      'High-performance machines for gamers',    '🎮', 2),
  ('Student Laptops',     'student-laptops',     'Budget-friendly for everyday study',      '📚', 3),
  ('Creator Laptops',     'creator-laptops',     'Powerful machines for design & video',    '🎨', 4),
  ('Ultrabooks',          'ultrabooks',          'Thin, light and premium portability',     '✨', 5),
  ('Workstation Laptops', 'workstation-laptops', 'Heavy-duty for engineering & 3D',         '⚙️', 6)
ON CONFLICT (slug) DO NOTHING;

-- ── 7. Seed Products ─────────────────────────────────────────
INSERT INTO products (
  name, slug, description, brand, category,
  price, compare_at_price, images, thumbnail_url,
  specs, condition_grade, battery_health, warranty,
  stock_qty, is_featured, meta_title, meta_description
) VALUES
(
  'Dell Latitude 7420',
  'dell-latitude-7420-i7-16gb-512gb',
  'Premium business ultrabook with 11th Gen Intel Core i7, 16 GB RAM and 512 GB NVMe SSD. Perfect for professionals who need reliability and performance on the go.',
  'Dell', 'business-laptops',
  185000, 220000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800","https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i7-1185G7","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"14\" FHD IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  'Excellent', '92%', '7-day checking warranty',
  3, true,
  'Dell Latitude 7420 – Used Laptop in Pakistan | ElectroGhar',
  'Buy used Dell Latitude 7420 with Intel Core i7, 16GB RAM, 512GB SSD in excellent condition. Best price in Pakistan with warranty.'
),
(
  'HP EliteBook 840 G8',
  'hp-elitebook-840-g8-i5-16gb-256gb',
  'Sleek and powerful HP EliteBook with 11th Gen Core i5. Ideal for office work, multitasking and everyday productivity.',
  'HP', 'business-laptops',
  155000, 180000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"Intel Core i5-1135G7","ram":"16GB DDR4","storage":"256GB NVMe SSD","display":"14\" FHD IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  'Good', '85%', '7-day checking warranty',
  5, true,
  'HP EliteBook 840 G8 – Used Laptop Price in Pakistan | ElectroGhar',
  'Shop used HP EliteBook 840 G8 Core i5 16GB RAM at the best price in Pakistan. Verified quality with warranty.'
),
(
  'Lenovo ThinkPad X1 Carbon Gen 9',
  'lenovo-thinkpad-x1-carbon-gen9-i7-16gb-512gb',
  'The legendary ThinkPad X1 Carbon — ultra-light, ultra-powerful. 11th Gen i7 with stunning 14-inch 2K display.',
  'Lenovo', 'ultrabooks',
  245000, 290000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"Intel Core i7-1165G7","ram":"16GB LPDDR4X","storage":"512GB NVMe SSD","display":"14\" 2K IPS","graphics":"Intel Iris Xe","os":"Windows 11 Pro"}',
  'Like New', '96%', '15-day checking warranty',
  2, true,
  'Lenovo ThinkPad X1 Carbon Gen 9 – Best Used Price | ElectroGhar',
  'Buy used Lenovo ThinkPad X1 Carbon Gen 9 in like-new condition. Premium ultrabook at the best price in Pakistan.'
),
(
  'ASUS ROG Strix G15',
  'asus-rog-strix-g15-ryzen7-rtx3060-16gb',
  'Gaming beast with AMD Ryzen 7 6800H and NVIDIA RTX 3060. 144Hz display for buttery-smooth gameplay.',
  'ASUS', 'gaming-laptops',
  295000, 350000,
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  '{"processor":"AMD Ryzen 7 6800H","ram":"16GB DDR5","storage":"512GB NVMe SSD","display":"15.6\" FHD 144Hz","graphics":"NVIDIA RTX 3060 6GB","os":"Windows 11 Home"}',
  'Excellent', '88%', '7-day checking warranty',
  1, true,
  'ASUS ROG Strix G15 – Used Gaming Laptop Pakistan | ElectroGhar',
  'Buy used ASUS ROG Strix G15 gaming laptop with RTX 3060 at the best price in Pakistan. Verified gaming performance.'
),
(
  'MacBook Air M1 2020',
  'macbook-air-m1-2020-8gb-256gb',
  'Apple MacBook Air with M1 chip — incredible performance and battery life. Perfect for students and creators.',
  'Apple', 'ultrabooks',
  225000, 260000,
  '["https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"]',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400',
  '{"processor":"Apple M1","ram":"8GB Unified","storage":"256GB SSD","display":"13.3\" Retina","graphics":"Apple M1 GPU","os":"macOS Sonoma"}',
  'Excellent', '94%', '15-day checking warranty',
  4, true,
  'MacBook Air M1 2020 – Used Price in Pakistan | ElectroGhar',
  'Buy used MacBook Air M1 2020 at the best price in Pakistan. Excellent condition with battery health guarantee.'
),
(
  'Dell XPS 15 9520',
  'dell-xps-15-9520-i7-32gb-1tb-rtx3050',
  'Stunning creator laptop with 12th Gen i7, 32GB RAM, RTX 3050 and gorgeous 15.6" 4K OLED display.',
  'Dell', 'creator-laptops',
  385000, 450000,
  '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
  '{"processor":"Intel Core i7-12700H","ram":"32GB DDR5","storage":"1TB NVMe SSD","display":"15.6\" 4K OLED","graphics":"NVIDIA RTX 3050 4GB","os":"Windows 11 Pro"}',
  'Like New', '97%', '15-day checking warranty',
  1, true,
  'Dell XPS 15 9520 – Used Creator Laptop Pakistan | ElectroGhar',
  'Buy used Dell XPS 15 9520 creator laptop at the best price in Pakistan. 4K OLED display, RTX graphics.'
),
(
  'HP ProBook 450 G8',
  'hp-probook-450-g8-i5-8gb-256gb',
  'Affordable workhorse for students and small businesses. 11th Gen Core i5 with solid build quality.',
  'HP', 'student-laptops',
  110000, 130000,
  '["https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800","https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800"]',
  'https://images.unsplash.com/photo-1496181664578-3103372bf986?w=400',
  '{"processor":"Intel Core i5-1135G7","ram":"8GB DDR4","storage":"256GB NVMe SSD","display":"15.6\" FHD","graphics":"Intel Iris Xe","os":"Windows 11 Home"}',
  'Good', '80%', '7-day checking warranty',
  8, false,
  'HP ProBook 450 G8 – Budget Used Laptop Pakistan | ElectroGhar',
  'Buy used HP ProBook 450 G8 at an affordable price in Pakistan. Best budget laptop for students.'
),
(
  'Lenovo ThinkPad T14 Gen 2',
  'lenovo-thinkpad-t14-gen2-ryzen5-16gb-256gb',
  'Durable business laptop with AMD Ryzen 5 Pro and excellent keyboard. Built to last with military-grade reliability.',
  'Lenovo', 'business-laptops',
  140000, 165000,
  '["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800","https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800"]',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
  '{"processor":"AMD Ryzen 5 PRO 5650U","ram":"16GB DDR4","storage":"256GB NVMe SSD","display":"14\" FHD IPS","graphics":"AMD Radeon","os":"Windows 11 Pro"}',
  'Good', '83%', '7-day checking warranty',
  6, false,
  'Lenovo ThinkPad T14 Gen 2 – Used Laptop Price Pakistan | ElectroGhar',
  'Buy used Lenovo ThinkPad T14 Gen 2 at the best price in Pakistan. Durable business laptop with warranty.'
),
(
  'MSI GF63 Thin',
  'msi-gf63-thin-i5-rtx3050-8gb-512gb',
  'Entry-level gaming laptop with Intel Core i5 and RTX 3050. Great value for aspiring gamers.',
  'MSI', 'gaming-laptops',
  175000, 210000,
  '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800","https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800"]',
  'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
  '{"processor":"Intel Core i5-11400H","ram":"8GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD 144Hz","graphics":"NVIDIA RTX 3050 4GB","os":"Windows 11 Home"}',
  'Good', '78%', '7-day checking warranty',
  3, false,
  'MSI GF63 Thin – Used Gaming Laptop Budget Price | ElectroGhar',
  'Buy used MSI GF63 Thin gaming laptop with RTX 3050 at the best budget price in Pakistan.'
),
(
  'HP ZBook Firefly 15 G8',
  'hp-zbook-firefly-15-g8-i7-t500-16gb-512gb',
  'Mobile workstation with ISV-certified NVIDIA T500 graphics. Perfect for AutoCAD, SolidWorks and 3D rendering.',
  'HP', 'workstation-laptops',
  285000, 340000,
  '["https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800","https://images.unsplash.com/photo-1496181664578-3103372bf986?w=800"]',
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400',
  '{"processor":"Intel Core i7-1165G7","ram":"16GB DDR4","storage":"512GB NVMe SSD","display":"15.6\" FHD IPS","graphics":"NVIDIA T500 4GB","os":"Windows 11 Pro"}',
  'Excellent', '90%', '15-day checking warranty',
  2, false,
  'HP ZBook Firefly 15 G8 – Used Workstation Laptop Pakistan | ElectroGhar',
  'Buy used HP ZBook Firefly 15 G8 workstation laptop at the best price in Pakistan. ISV-certified performance.'
);
