-- ============================================================
-- ElectroGhar — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================

-- ── Categories ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,          -- emoji or icon name
  image_url   TEXT,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Products ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
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
  images           JSONB DEFAULT '[]'::jsonb,    -- array of image URLs
  thumbnail_url    TEXT,
  
  -- Specifications (flexible JSON schema)
  specs            JSONB DEFAULT '{}'::jsonb,
  -- Example: { "processor": "Intel Core i7-1165G7", "ram": "16GB DDR4", ... }
  
  -- Condition & availability
  condition_grade  TEXT DEFAULT 'Good'
                   CHECK (condition_grade IN ('Like New', 'Excellent', 'Good', 'Fair')),
  battery_health   TEXT,          -- e.g. "85%"
  warranty         TEXT,          -- e.g. "7-day checking warranty"
  stock_qty        INT DEFAULT 1,
  is_available     BOOLEAN DEFAULT true,
  
  -- Flags
  is_featured      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  
  -- SEO
  meta_title       TEXT,
  meta_description TEXT,
  
  -- WhatsApp
  whatsapp_number  TEXT DEFAULT '+923001234567',
  
  -- Timestamps
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active)   WHERE is_active  = true;
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_condition   ON products(condition_grade);

-- ── Auto-update updated_at ──────────────────────────────────
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

-- ── Row-Level Security (optional for future auth) ───────────
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Public read policy (anonymous users can view active products)
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admin write policies (placeholder — enable after setting up auth)
-- CREATE POLICY "Admin write products"
--   ON products FOR ALL
--   USING (auth.role() = 'authenticated');
