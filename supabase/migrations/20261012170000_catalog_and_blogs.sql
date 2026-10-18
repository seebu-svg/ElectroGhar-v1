-- Non-destructive baseline for the existing ElectroGhar schema.
-- Compatible with a fresh Supabase project and the current manually initialized project.
SET search_path = public;

-- ── 1. Categories (with hierarchy) ───────────────────────────
CREATE TABLE IF NOT EXISTS categories (
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

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ── 2. Products ──────────────────────────────────────────────
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
  whatsapp_number  TEXT DEFAULT '+92339244435',

  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_brand          ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category       ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_condition_type ON products(condition_type);
CREATE INDEX IF NOT EXISTS idx_products_featured       ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active         ON products(is_active)   WHERE is_active  = true;
CREATE INDEX IF NOT EXISTS idx_products_price          ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_condition      ON products(condition_grade);

-- ── 3. Auto-update updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON products   FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin insert products" ON public.products;
CREATE POLICY "Admin insert products" ON products   FOR INSERT TO authenticated   WITH CHECK (true);
DROP POLICY IF EXISTS "Admin update products" ON public.products;
CREATE POLICY "Admin update products" ON products   FOR UPDATE TO authenticated   USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin delete products" ON public.products;
CREATE POLICY "Admin delete products" ON products   FOR DELETE TO authenticated   USING (true);
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
CREATE POLICY "Admin insert categories" ON categories FOR INSERT TO authenticated   WITH CHECK (true);
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
CREATE POLICY "Admin update categories" ON categories FOR UPDATE TO authenticated   USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;
CREATE POLICY "Admin delete categories" ON categories FOR DELETE TO authenticated   USING (true);


-- ── Blog Categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Blogs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT,
  content          TEXT,               -- plain text; blank-line paragraphs,
                                     -- "## " h2, "### " h3, "- " list items
  cover_image      TEXT,
  category         TEXT REFERENCES blog_categories(slug) ON DELETE SET NULL,
  author           TEXT DEFAULT 'ElectroGhar Team',
  author_role      TEXT,
  tags             JSONB DEFAULT '[]'::jsonb,

  is_featured      BOOLEAN DEFAULT false,
  is_published     BOOLEAN DEFAULT false,
  published_at     TIMESTAMPTZ,
  views            INT DEFAULT 0,

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,

  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_blogs_category   ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published  ON blogs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blogs_featured   ON blogs(is_featured)  WHERE is_featured  = true;
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);

-- ── Auto-update updated_at (reuses the existing trigger fn) ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_blogs_updated_at ON public.blogs;
CREATE TRIGGER trg_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_blog_categories_updated_at ON public.blog_categories;
CREATE TRIGGER trg_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row-Level Security ──────────────────────────────────────
ALTER TABLE blogs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read published blogs" ON public.blogs;
CREATE POLICY "Public read published blogs" ON blogs FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Public read blog categories" ON public.blog_categories;
CREATE POLICY "Public read blog categories" ON blog_categories FOR SELECT
  USING (true);
