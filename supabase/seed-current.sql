-- Development fixtures only; never automatically pushed to production.
-- ── 5. Top-level categories ──────────────────────────────────
INSERT INTO categories (name, slug, description, icon, sort_order, is_featured) VALUES
  ('Laptops',                   'laptops',               'New & used laptops from every major brand',      '💻', 1, true),
  ('PCs & Desktops',            'pcs-desktops',          'Desktops, gaming rigs, workstations & mini PCs', '🖥️', 2, true),
  ('Monitors & Displays',       'monitors-displays',     'Gaming, 4K, ultrawide & professional monitors',  '📺', 3, true),
  ('Storage & Accessories',     'storage-accessories',   'SSDs, HDDs, RAM, keyboards, mice & more',        '💾', 4, true),
  ('Gadgets & Electronics',     'gadgets-electronics',   'Smart watches, earbuds, power banks & gadgets',  '⚡', 5, true)
ON CONFLICT (slug) DO NOTHING;

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
JOIN categories c ON c.slug = 'laptops'
ON CONFLICT (slug) DO NOTHING;

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
JOIN categories c ON c.slug = 'pcs-desktops'
ON CONFLICT (slug) DO NOTHING;

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
JOIN categories c ON c.slug = 'monitors-displays'
ON CONFLICT (slug) DO NOTHING;

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
JOIN categories c ON c.slug = 'storage-accessories'
ON CONFLICT (slug) DO NOTHING;

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
JOIN categories c ON c.slug = 'gadgets-electronics'
ON CONFLICT (slug) DO NOTHING;

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
)
ON CONFLICT (slug) DO NOTHING;

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
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED — blog categories
-- ============================================================
INSERT INTO blog_categories (name, slug, description, sort_order) VALUES
  ('Buying Guides',        'buying-guides',        'Smart ways to spend your money on tech in Pakistan.', 1),
  ('Tech Tips',            'tech-tips',            'Practical tips to get more out of your machines.',    2),
  ('Troubleshooting',      'troubleshooting',      'Fix common laptop problems yourself, step by step.',  3),
  ('Reviews & Comparisons','reviews-comparisons',  'Head-to-head comparisons from real shop-floor experience.', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED — 8 blog posts (all published, 2 featured)
-- ============================================================

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'How to Buy a Used Laptop in Pakistan — The Complete Checklist',
  'how-to-buy-a-used-laptop-in-pakistan',
  $txt$Battery health, dead pixels, hinge strength, keyboard wear — the exact checks we run on every laptop before it earns a listing on ElectroGhar. Print this checklist before you shop anywhere.$txt$,
  $txt$A used laptop can be the best value in tech — or an expensive mistake. The difference is almost never luck. It is a checklist, done in the right order, in about fifteen minutes.

This is the same inspection process we run at ElectroGhar before any machine gets listed. Use it whether you buy from us, from Hall Road, or from a stranger on OLX.

## 1. Start With the Hinge and Body

Open and close the lid slowly, twice. A healthy hinge moves smoothly and holds any angle. A loose hinge means the machine was carried open, dropped, or worn hard — and hinge repair on modern laptops often means replacing the whole top assembly.

Run your fingers along the edges. Cracks near the corners and screw holes tell you the machine has been opened before, or worse, dropped.

## 2. Check the Screen Like You Mean It

Set the desktop background to pure black and look at the whole panel in a dark room. Dead pixels show as tiny bright dots. Backlight bleed glows around the edges. Now switch to pure white and look for dark patches and pressure marks.

Also check brightness at 100%. A dim panel at full brightness usually means a worn backlight or a cheap replacement panel.

## 3. Test Every Single Key

Open Notepad and press every key, in rows. You are looking for keys that register twice, do not register, or feel mushy. Keyboard replacement is cheap on business laptops and expensive on thin ultrabooks — know which one you are holding.

## 4. Battery Health Is Non-Negotiable

On Windows, run powercfg /batteryreport from the command prompt. It gives you design capacity versus full charge capacity. Below 70% of design capacity, negotiate the price down or walk away. Below 50%, assume you will replace the battery soon.

Any seller who refuses a battery report is telling you something.

## 5. Stress the CPU for Ten Minutes

Plug in a USB drive with a stress test, or simply play a YouTube video at 1080p for ten minutes while feeling the exhaust vent. If the fan screams and the chassis becomes painful to touch within minutes, the cooling system is clogged or the thermal paste is dead.

## 6. Check the Storage

Run a quick SMART read with a free tool like CrystalDiskInfo. You want "Good" health, and on SSDs, a reasonable amount of remaining life. A failing drive does not always announce itself — SMART data does.

## 7. Verify the Ports and Webcam

HDMI, every USB port, the audio jack, the card reader, Wi-Fi, and the webcam. Test each one. Dead ports are cheap to discover now and annoying to live with later.

## Red Flags That End the Inspection

- Seller will not let you test on battery power
- Windows is not activated or the license is "being sorted"
- Machine was "used very lightly" but the keyboard is shiny and worn
- No charger, or a charger from a different brand
- Price that is dramatically below market with an urgent story

## The Honest Bottom Line

A good used laptop beats a bad new one every time. Business lines like the Dell Latitude, HP EliteBook, and Lenovo ThinkPad were built to survive three office workers and still have years left in them. Bring this checklist, take your time, and never let a seller rush the inspection — patience is the one upgrade that costs nothing.$txt$,
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
  'buying-guides',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["used laptops","checklist","buying guide","pakistan"]',
  true,
  true,
  '2026-08-28T10:00:00+05:00',
  842,
  'Used Laptop Buying Checklist — Pakistan Edition | ElectroGhar',
  $txt$The 15-minute inspection checklist we run on every used laptop: hinge, screen, keyboard, battery health, thermals, storage, and the red flags that end the deal.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Refurbished vs Used vs New: Which Laptop Should You Buy?',
  'refurbished-vs-used-vs-new-laptops',
  $txt$Refurbished machines are tested and restored. Used machines are sold as-is. New machines cost the most. Here is how to choose based on your budget, your risk tolerance, and how long you plan to keep the machine.$txt$,
  $txt$Every week someone asks us the same question: "Should I buy new, used, or refurbished?" The honest answer is that all three can be the right choice — for different people. Here is how to decide in under five minutes.

## What You Actually Get With Each Option

A new laptop gives you a sealed unit, a full warranty, the latest generation of silicon, and the highest price. A used laptop gives you the lowest price and the machine exactly as the previous owner left it. A refurbished laptop sits in between: a used machine that has been inspected, repaired where needed, cleaned, and retested before resale.

## Where Each Option Wins

Buy new when you need specific modern features: current-generation performance, a high-refresh display, Thunderbolt, or a manufacturer warranty you can lean on for three years. If your work depends on the machine and downtime costs you money, the warranty alone can justify the premium.

Buy used when the machine is a known-reliable business line and you can inspect it properly. This is where the best price-to-performance lives in Pakistan. A three-year-old Latitude or ThinkPad at a third of its original price, checked properly, will outlast a brand-new budget consumer laptop.

Buy refurbished when you want used-market pricing with some of the new-machine peace of mind. A serious refurbisher replaces worn parts, verifies battery health, reinstalls a clean OS, and offers at least a short warranty. You pay slightly more than raw used — that difference is buying risk reduction.

## The Real Cost Comparison

Consider three ways to end up with a solid work machine:

- New consumer laptop: latest design, one-year warranty, lowest build quality tier
- Used business laptop: two to three generations old, enterprise build quality, no warranty beyond the seller's checking period
- Refurbished business laptop: same machine as used, plus replaced wear parts and a short warranty

The spec sheet will not show you the difference. The keyboard flex, the hinge, and the chassis rigidity will — three years later.

## The Questions That Decide It

Ask yourself, in order:

- Can I afford to replace this machine in a year if it fails? If no, lean new or refurbished.
- Do I know how to inspect a used laptop, or do I have someone who does? If no, buy from a seller who checks and stands behind the machine.
- Do I need this-generation performance, or is last generation plenty for my work?

Most students, office workers, and developers we serve answer "last generation is plenty" — which is why used and refurbished business laptops leave our shop fastest.

## One Warning for All Three

Whatever you buy, insist on knowing the battery's actual capacity and the storage drive's health. These are the two parts that age fastest, they are invisible in marketing photos, and they are the two parts that make an otherwise perfect machine frustrating to live with.$txt$,
  'https://images.unsplash.com/photo-1496181664578-3103372bf986?w=1200&q=80',
  'buying-guides',
  'ElectroGhar Team',
  NULL,
  '["refurbished","used","buying guide"]',
  false,
  true,
  '2026-08-20T10:00:00+05:00',
  519,
  'Refurbished vs Used vs New Laptops | ElectroGhar',
  $txt$New, used, or refurbished — which laptop is right for you? A shop-floor comparison of price, risk, build quality, and warranty for Pakistani buyers.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Best Budget Laptops Under PKR 50,000 in Pakistan (2026 Edition)',
  'best-budget-laptops-under-50000-pkr',
  $txt$Fifty thousand rupees is the most competitive price bracket in Pakistan. Here is what that budget realistically buys today — and the exact business-grade machines we would pick first.$txt$,
  $txt$PKR 50,000 is the sweet spot of the Pakistani laptop market — enough for a genuinely capable machine, low enough that every rupee has to work. Here is what that budget buys in 2026, and what to avoid.

## What 50K Realistically Gets You

Forget new machines at this price — a new laptop under 50K means a Celeron processor, 4GB of soldered RAM, and a 1366x768 panel. The smart play is a used or refurbished business laptop, two to four generations old, from the corporate fleets that get retired on schedule overseas.

At this budget you should target:

- 8th to 10th generation Intel Core i5 (or Ryzen 5 equivalents)
- 8GB of RAM, ideally 16GB or upgradeable
- 256GB SSD — non-negotiable in 2026
- A 1080p IPS display
- Business-line build quality

## The Machines We Would Pick First

The Lenovo ThinkPad T480 remains the benchmark. Legendary keyboard, easy to service, RAM up to 32GB, and typically available in this bracket with an i5 and 8GB. If you find one with a 1080p panel, buy it.

The Dell Latitude 7490 is the polish pick: thinner than the ThinkPad, excellent 1080p IPS panels, strong hinges, and widely available parts in Pakistan.

The HP EliteBook 840 G5 is the value sleeper — often cheaper than the other two with nearly identical real-world performance, a bright display, and a genuinely good keyboard.

All three were 250,000+ rupee machines when new. That is the entire thesis of the used market: yesterday's flagship beats today's budget tier.

## What to Avoid at This Price

- Consumer laptops with 4GB RAM and eMMC storage — they will feel slow within a year
- Anything without an SSD, regardless of how good the rest of the spec looks
- Gaming laptops at this price point — they are usually six-plus years old with dying GPUs and cooked cooling
- Machines with broken hinges or battery "issues" — repairs will eat your savings

## Spend the Difference Wisely

If you find a machine at 45K with 8GB of RAM, spending the remaining 5K on a RAM stick or a bigger SSD does more for your daily experience than hunting for a marginally faster CPU. An SSD and RAM upgrade transforms a good laptop; a slightly newer processor does not.

## The ElectroGhar Shortcut

Every machine we list in this bracket has already passed the full inspection checklist — battery health verified, storage SMART-checked, thermals stress-tested. If you would rather skip the OLX lottery, that is exactly why we exist.$txt$,
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
  'buying-guides',
  'Sana Malik',
  'Content & Research',
  '["budget laptops","pkr 50000","buying guide"]',
  false,
  true,
  '2026-08-15T10:00:00+05:00',
  677,
  'Best Laptops Under PKR 50,000 (2026) | ElectroGhar',
  $txt$What PKR 50,000 really buys in 2026: ThinkPad T480, Latitude 7490, EliteBook 840 G5, upgrade strategy, and the traps to avoid in the used market.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'SSD vs HDD: Why Storage Speed Matters More Than Size',
  'ssd-vs-hdd-storage-guide',
  $txt$A 256GB SSD will feel dramatically faster than a 1TB HDD. Here is why — and how much storage you actually need for work, study, or gaming.$txt$,
  $txt$If your laptop takes two minutes to boot and another minute to open Chrome, your problem is almost certainly not the processor. It is the hard drive. This is the single most misunderstood spec in the market, so let us settle it.

## The Speed Gap Is Not Subtle

A mechanical hard drive reads data at roughly 100-150 MB/s. A SATA SSD delivers 500-550 MB/s. An NVMe SSD delivers 3,000-7,000 MB/s. But raw numbers understate it — the real difference is random access, where an SSD is hundreds of times faster.

In daily life that means:

- Boot times drop from two minutes to fifteen seconds
- Apps open instantly instead of after a coffee sip
- Files copy in seconds
- The laptop never feels like it is "thinking"

## Why the HDD Still Exists

Price per gigabyte. A 1TB HDD costs less than a 256GB SSD, and marketing that leads with "1TB storage!" sells machines to people who have not felt the difference yet. In our workshop, the single most common upgrade we perform is swapping an HDD for an SSD — and the most common reaction is that it feels like a new laptop.

## How Much Storage Do You Actually Need?

Be honest about your usage:

- 256GB — plenty for study, office work, and browsing, if you keep media in the cloud
- 512GB — the comfortable default for most people, including light gaming
- 1TB and above — video editing, large game libraries, or big local media collections

External storage is cheap and fast over USB 3.0. Internal SSD speed is not replaceable. Prioritize accordingly.

## SATA vs NVMe — Does It Matter?

If both are options in your budget, take NVMe: it is faster and usually newer. But do not reject a great laptop because it has a SATA SSD — the jump from HDD to any SSD dwarfs the jump from SATA to NVMe.

## The Buying Advice

Never buy a laptop with a mechanical hard drive as its only storage in 2026 — no exceptions. If you are buying used and the machine has an HDD, budget for an SSD swap and treat it as a two-step purchase. If the machine already has an SSD, check its health with CrystalDiskInfo before paying; SSDs have a finite write life and a worn one is a negotiation point.

Speed you feel every single day beats capacity you touch twice a year.$txt$,
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=1200&q=80',
  'tech-tips',
  'ElectroGhar Team',
  NULL,
  '["ssd","hdd","storage","tech tips"]',
  false,
  true,
  '2026-08-10T10:00:00+05:00',
  448,
  'SSD vs HDD: Which Storage Do You Need? | ElectroGhar',
  $txt$Why any SSD feels up to a hundred times faster than an HDD, how much storage you really need, and the SATA vs NVMe question — explained simply.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  '7 Windows Settings Every New Laptop Owner Should Change',
  'windows-settings-new-laptop-owners',
  $txt$Fresh Windows is tuned for Microsoft, not for you. These seven settings remove the ads, the bloat, and the privacy leaks — and take under ten minutes total.$txt$,
  $txt$A new laptop arrives tuned to serve everyone except its owner. Ten minutes in Settings fixes that. Do these in order.

## 1. Uninstall What You Did Not Order

Open Installed Apps and remove the pre-installed trial antivirus, the vendor "assistant" utilities, and any game you did not ask for. Trial antivirus in particular fights Windows Defender for resources while nagging you to pay. Defender is genuinely good now.

## 2. Turn Off Startup Programs

Open Task Manager, go to the Startup tab, and disable everything you do not explicitly want running at boot — updaters, helper apps, sync clients. Each one steals boot time and RAM forever. Your laptop will feel faster immediately.

## 3. Kill the Ads and Suggestions

In Settings, search for "Content" under Personalization and turn off suggestions, tips, and experiences that feed you promos in the Start menu and lock screen. Windows should not be an advertising surface you paid for.

## 4. Set Your Power Plan Properly

For most people: Settings, System, Power, and set the screen and sleep timers to something sane. On a laptop, avoid "Best performance" on battery — it trades a lot of runtime for a little speed. Balanced is right for nearly everyone.

## 5. Check Your Privacy Settings

In Settings, Privacy & security, walk through the permissions. Does your calculator app really need location? Does everything need microphone access? Most should be off by default. While you are there, review the diagnostic data setting and set it to the minimum you are comfortable with.

## 6. Enable Storage Sense

In Settings, System, Storage, turn on Storage Sense so Windows automatically clears temp files and empties the recycle bin. On a 256GB SSD, this quietly prevents the "your disk is almost full" surprise six months from now.

## 7. Create a Restore Point Before You Tinker

Search for "Create a restore point", open it, and create one now, while the system is clean. If a future update or app install goes wrong, you can roll back in minutes instead of reinstalling everything.

## Bonus: Move Your Files Off the Desktop

Not for tidiness — for safety. A desktop full of documents is a desktop full of documents that are not being backed up. Keep work in Documents or OneDrive and sync it. When a drive dies, and eventually one will, you will be glad the important things lived somewhere with a copy.

That is the whole ritual. None of it costs anything, all of it saves time — and a machine set up this way stays fast for years instead of months.$txt$,
  'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80',
  'tech-tips',
  'Sana Malik',
  'Content & Research',
  '["windows","setup","tech tips","new laptop"]',
  false,
  true,
  '2026-08-05T10:00:00+05:00',
  391,
  '7 Windows Settings to Change on a New Laptop | ElectroGhar',
  $txt$Remove the ads, bloat, and privacy leaks from fresh Windows in ten minutes: startup programs, power plans, Storage Sense, restore points, and more.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Laptop Overheating? 7 Fixes That Actually Work',
  'laptop-overheating-fixes',
  $txt$Fans screaming, chassis hot, performance dying? Overheating has a short list of real causes — and most of them are fixable at home. Here is the diagnostic order we use in the workshop.$txt$,
  $txt$"Laptop overheating" covers several different problems. Before you fix anything, identify which one you actually have: loud fans, a hot chassis, thermal shutdowns, or just slower performance under load. The fixes differ. Here is the order we work through at the bench — cheapest and most likely first.

## 1. Give the Fans Somewhere to Breathe

The number one cause we see: the laptop used on a bed, a lap, or a cushion. Every one of these blocks the intake vents on the bottom. Hard, flat surfaces only. If your lap is the desk, a rigid lap tray is a 500-rupee fix for a 50,000-rupee problem.

## 2. Blow the Dust Out

Two to three years of use cakes the heatsink fins with dust felt. A can of compressed air through the exhaust and intake vents, in short bursts, clears a shocking amount. Hold the fan still with a toothpick through the vent if you can — spinning a fan with compressed air can damage it.

If the machine still runs hot after this, it needs to be opened and cleaned properly.

## 3. Repaste the CPU

Thermal paste dries out in three to five years and stops conducting heat into the heatsink. Symptoms: fine when idle, hot and throttled within minutes of load. A repaste with good paste costs little and drops temperatures dramatically on older machines. On most business laptops this is a 20-minute job with a screwdriver.

## 4. Check What Is Actually Loading the CPU

Open Task Manager and sort by CPU. Background updaters, browser tabs running scripts, or malware can pin the processor at 100% — and a pinned processor means sustained heat. A laptop that is only hot while a runaway process burns CPU is not a cooling problem; it is a software problem.

## 5. Mind the Ambient Temperature

In a Pakistani summer, a 45-degree room means your laptop starts 20 degrees hotter than its design assumption. Nothing is broken. Shade the machine, add airflow, and accept that physics is undefeated.

## 6. Watch for the Fan That Never Spins

If the machine is hot and silent, the fan may be dead — seized bearing or a broken ribbon. This needs a fan replacement, and it needs it soon: a laptop that passively cooks its silicon is dying in slow motion.

## 7. Know When It Is the Design

Some machines — thin gaming laptops especially — simply run hot by design and throttle to compensate. If yours has always been this way since new, the fix list above will help at the margins, but the thermals are the thermals.

## What Not to Do

Do not install third-party fan-control tools to force the fan to maximum — they mask the symptom while the cause gets worse. And do not use a laptop cooling pad as a substitute for cleaning; a pad pushing air into clogged fins is a fan blowing at a wall.

Clean it, repaste it, let it breathe. In roughly 8 out of 10 machines that come to our bench "overheating", one of those three things is the entire story.$txt$,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
  'troubleshooting',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["overheating","cooling","troubleshooting","maintenance"]',
  true,
  true,
  '2026-07-28T10:00:00+05:00',
  726,
  'Laptop Overheating: 7 Fixes That Work | ElectroGhar',
  $txt$The workshop diagnostic order for overheating laptops: airflow, dust, thermal paste, background load, dead fans — plus what not to do.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Laptop Won''t Turn On? A Step-by-Step Diagnostic',
  'laptop-wont-turn-on-diagnostic',
  $txt$Dead laptop? Do not panic and do not start disassembling it. Work through this sequence — it finds the cause in most cases, and tells you when it is time for a technician.$txt$,
  $txt$A laptop that will not turn on is rarely as dead as it looks. Work through this sequence in order — it isolates the fault in most machines in under ten minutes.

## Step 1: Define "Won''t Turn On"

Watch and listen carefully when you press the power button. Which case is yours?

- Case A — totally dead: no lights, no fans, no response at all
- Case B — signs of life: lights or fan spin, but a black screen
- Case C — it starts, shows something, then dies

Each case points somewhere different. Do not skip this step.

## Step 2: Case A — The Power Path

With no signs of life, suspect the power path first. Remove everything: charger, USB devices, SD cards, dongles. Hold the power button for 30 full seconds to drain residual charge — this resets the EC and fixes a surprising number of "dead" laptops.

Now plug in the charger and look for a charging LED. No LED at all? Try a different outlet, then test the charger: most third-party USB-C chargers will at least light the LED if the port and charger are alive. If the charger is fine and the LED stays dark on every outlet, the fault is the DC jack, the charging circuit, or the board — workshop territory.

## Step 3: Case B — Power but No Display

The machine is on (fan, lights, maybe heat) but the screen stays black. Do the flashlight test: shine a light at the screen in a dark room. If you can make out a faint image, the GPU is fine and the backlight has failed.

Then do the external display test: connect a monitor over HDMI. External works means GPU and system are alive — the problem is the panel or its cable. External also black means something deeper; try the Step 2 reset anyway.

Also listen for beep patterns or blink codes on the power LED — most manufacturers encode the failing component in them. Write down the pattern before you search for it; "3 blinks" means something specific to your model.

## Step 4: Case C — Starts Then Dies

Rapid shutdown points to thermal protection (see our overheating guide) or a failing power delivery. Shutting down at the same point in boot every time can also be storage failure — the system dies the moment it hands off to the drive.

## Step 5: RAM Reseat

On laptops with accessible RAM, power off, unplug, remove the battery if removable, then reseat both sticks — remove and firmly reinsert. A stick that has walked a millimetre out of its socket produces exactly this class of symptom. If there are two sticks, boot with each one alone; a bad stick identifies itself.

## When to Stop and Bring It In

Stop and get a technician if: the machine smells burnt, the charger LED indicates power but the EC reset and RAM reseat changed nothing, or the blink code points to the board. Board-level repair needs tools and schematics, not screwdriver courage.

One last thing — before any of this, check the obvious: is the charger actually the right wattage for the machine? A 45W charger on a gaming laptop that demands 180W will power lights and nothing else. We have seen "dead" laptops revived by the right brick more times than we can count.$txt$,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
  'troubleshooting',
  'ElectroGhar Team',
  NULL,
  '["troubleshooting","wont turn on","diagnostic","repair"]',
  false,
  true,
  '2026-07-20T10:00:00+05:00',
  312,
  'Laptop Won''t Turn On — Step-by-Step Diagnostic | ElectroGhar',
  $txt$Dead laptop diagnostic in order: power-path checks, EC reset, backlight flashlight test, blink codes, RAM reseat — and when to call a technician.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Gaming PC or Gaming Laptop? An Honest Comparison',
  'gaming-pc-vs-gaming-laptop',
  $txt$Same budget, two very different machines. We break down performance, thermals, upgrades, and long-term value for Pakistani gamers — including the electricity math nobody mentions.$txt$,
  $txt$"For the same money, should I build a gaming PC or buy a gaming laptop?" We get this weekly, and the honest answer starts with a question back: where will you actually use it?

## The Performance Reality

A gaming PC at the same price as a gaming laptop simply performs better. Laptops pay a "portability tax" of roughly 20-30%: a mobile GPU is physically smaller, runs cooler, and is tuned to sip power. An RTX 4060 in a desktop is not the same silicon situation as an RTX 4060 in a laptop, even though the sticker says the same thing.

The desktop also holds its boost clocks under sustained load. A thin gaming laptop starts fast, then thermally throttles ten minutes into a session as heat saturates the chassis. Same sticker, different machine.

## Thermals and Noise

Desktops have volume to work with — big coolers, big airflow, quiet fans. Gaming laptops are a compromise between thickness and heat, and under load most of them sound like a hair dryer having an argument. If you game with headphones this matters less. If you share a room, it matters a lot.

## Upgradability — The Long Game

This is where the two paths really separate. A desktop replaces parts: GPU in three years, more storage next month, CPU when the platform demands it. A laptop replaces, realistically, RAM and storage — the GPU and CPU are soldered forever. The gaming laptop you buy is the machine you will have until you replace it entirely.

In a market like Pakistan, where import prices swing wildly, being able to upgrade one part instead of rebuying everything is genuine financial protection.

## The Portability Question

None of the PC advantages matter if you cannot use one. Students moving between home and hostel, anyone who games at a friend's place, people whose "desk" is wherever there is space — for them the laptop is not a compromise, it is the only option that works.

Be honest here: we have seen many "portable" gaming laptops that have not left the desk in two years. If that will be you, take the desktop performance.

## The Running-Cost Math Nobody Mentions

Desktops are easier to cool but typically draw more power at the wall, and used-market desktops in Pakistan often arrive with aging PSUs that deserve replacement. Laptops bundle the display, keyboard, and a battery-backed UPS for load shedding — that last point is not small in Pakistan. A desktop needs a UPS or it dies with the lights.

## Our Honest Recommendation

If the machine will mostly live on a desk and maximum frames per rupee is the goal: build a PC, and put real money into the PSU and cooling before chasing the GPU tier.

If you need one machine for study, work, and gaming: a used business laptop for daily work plus patience, or a well-cooled gaming laptop if the budget truly stretches — but check its thermals under load before paying.

If you move around and game seriously: the gaming laptop is not a compromise, it is the answer. Buy a thick one. Thin gaming laptops are a bet against physics.

Come tell us your budget and your situation — we stock both, so we have no reason to push you either way. That is the advantage of asking a shop that sells both.$txt$,
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&q=80',
  'reviews-comparisons',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["gaming","pc build","comparison"]',
  false,
  true,
  '2026-07-12T10:00:00+05:00',
  588,
  'Gaming PC vs Gaming Laptop — Which to Buy? | ElectroGhar',
  $txt$Desktop vs gaming laptop compared honestly: the portability tax, thermals, upgradability, load-shedding math, and who should actually buy which.$txt$
)
ON CONFLICT (slug) DO NOTHING;

-- Normalize development fixtures to the current category taxonomy.
DROP TABLE IF EXISTS old_category_roots;
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

