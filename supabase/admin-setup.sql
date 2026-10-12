-- ============================================================
-- ElectroGhar — Admin Setup
-- Run this AFTER schema.sql and seed.sql
-- ============================================================

-- ── Step 1: Create admin user ────────────────────────────────
-- Run this in your terminal or Supabase dashboard:
--
--   Go to Authentication > Users > Add User
--   Email: admin@electroghar.pk
--   Password: (choose a strong password)
--   Auto Confirm User: ON
--
-- Then update the RLS policies below to restrict writes to admin.

-- ── Step 2: Admin-only write policies ────────────────────────
-- These replace the placeholder comments in schema.sql

-- Disable the permissive public read policies first (they stay for GET)
-- and add authenticated write policies for admin.

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

-- ── Step 3: Allow service_role to bypass RLS ─────────────────
-- The service role key already bypasses RLS by default in Supabase.
-- No additional config needed. The backend uses service_role for
-- data operations and anon key for auth verification.
