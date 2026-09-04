import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const productRoutes = Router();

/**
 * Resolve a category slug to itself + all descendant slugs.
 * e.g. "laptops" → ["laptops", "business-laptops", "gaming-laptops", ...]
 */
async function getCategoryWithDescendants(slug) {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, parent_id")
    .eq("is_active", true);

  if (error || !data) return [slug];

  const target = data.find((c) => c.slug === slug);
  if (!target) return [slug];

  const slugs = [target.slug];
  const walk = (parentId) => {
    data
      .filter((c) => c.parent_id === parentId)
      .forEach((c) => {
        slugs.push(c.slug);
        walk(c.id);
      });
  };
  walk(target.id);
  return slugs;
}

/** Sanitize a search term for PostgREST ilike filters */
function sanitizeSearch(term) {
  return String(term).replace(/[%_,()\\]/g, " ").trim();
}

// ── GET /api/products — list with search, filter, sort, pagination ─────────
productRoutes.get("/", async (req, res, next) => {
  try {
    const {
      search = "",
      brand,
      category,
      conditionType,
      minPrice,
      maxPrice,
      condition,
      featured,
      deals,
      sort = "created_at",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Enhanced search — searches name, brand, description AND specs
    // via the auto-generated search_text column. Words are ANDed, so
    // "dell i7" matches any product containing both words anywhere
    // (not just adjacent), e.g. "Dell Latitude 7420, i7-1185G7".
    const q = sanitizeSearch(search);
    if (q) {
      q.split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .forEach((word) => {
          query = query.ilike("search_text", `%${word}%`);
        });
    }

    // Filters
    if (brand) query = query.eq("brand", brand);
    if (category) {
      // Top-level categories include all their subcategories
      const slugs = await getCategoryWithDescendants(category);
      query = query.in("category", slugs);
    }
    if (conditionType) query = query.eq("condition_type", conditionType);
    if (condition) query = query.eq("condition_grade", condition);

    // Collections: Best Sellers (featured) & Daily Deals (discounted)
    if (featured === "1" || featured === "true") query = query.eq("is_featured", true);
    if (deals === "1" || deals === "true") query = query.not("compare_at_price", "is", null);
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    // Sort
    query = query.order(sort, { ascending: order === "asc" });

    // Pagination
    query = query.range(offset, offset + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      products: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/featured ─────────────────────────────────────────────
productRoutes.get("/featured", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ products: data });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/brands — distinct brand list ─────────────────────────
productRoutes.get("/brands", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .eq("is_active", true);

    if (error) throw error;
    const brands = [...new Set(data.map((p) => p.brand).filter(Boolean))].sort();
    res.json({ brands });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/suggest?q= — search autocomplete (max 8) ─────────────
productRoutes.get("/suggest", async (req, res, next) => {
  try {
    const q = sanitizeSearch(req.query.q || "");
    if (!q) return res.json({ products: [] });

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, brand, price, thumbnail_url, images, category, condition_type, condition_grade")
      .eq("is_active", true)
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order("is_featured", { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ products: data || [] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/:slug — single product by slug ───────────────────────
productRoutes.get("/:slug", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Related products: same category first, then same parent category
    const categorySlugs = await getCategoryWithDescendants(data.category);
    const { data: related } = await supabase
      .from("products")
      .select("id, name, slug, price, images, thumbnail_url, condition_grade, condition_type, brand, category")
      .eq("is_active", true)
      .in("category", categorySlugs)
      .neq("id", data.id)
      .limit(4);

    res.json({ product: data, related: related || [] });
  } catch (err) {
    next(err);
  }
});
