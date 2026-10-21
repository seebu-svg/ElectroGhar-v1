import { Router } from "express";
import { supabase } from "../config/supabase.js";

import { selectDiscountedPage } from "../services/productBrowsing.js";
import { visibleCategorySlugs } from "../services/catalog.js";

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

// ── GET /api/products , list with search, filter, sort, pagination ─────────
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
      processor, ram, storage,
      sort = "created_at",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    const pageNumber = Math.max(1, Math.floor(Number(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 12));
    const offset = (pageNumber - 1) * pageSize;
    const sortField = ['price', 'created_at', 'name', 'stock_qty', 'discount'].includes(sort) ? sort : 'created_at';
    const onlyDeals = deals === '1' || deals === 'true';

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .in("category", await visibleCategorySlugs());

    // Enhanced search , searches name, brand, description AND specs
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

    for (const [key, value] of Object.entries({ processor, ram, storage })) {
      if (typeof value === 'string' && value) query = query.eq(`specs->>${key}`, value);
    }

    // Collections: Best Sellers (featured) & Daily Deals (discounted)
    if (featured === "1" || featured === "true") query = query.eq("is_featured", true);
    if (deals === "1" || deals === "true") query = query.not("compare_at_price", "is", null);
    if (minPrice) query = query.gte("price", Number(minPrice));
    if (maxPrice) query = query.lte("price", Number(maxPrice));

    // Add a stable tie-breaker so equal prices/stocks cannot shuffle across pages.
    query = query.order(sortField === 'discount' ? 'id' : sortField, { ascending: sortField === 'discount' || order === 'asc' });
    if (sortField !== 'discount') query = query.order('id');
    let data, count;
    if (sortField === 'discount' || onlyDeals) {
      // Derived discounts must be sorted/validated before pagination, never within a single page.
      const candidates = [];
      for (let start = 0; ; start += 1000) {
        const result = await query.range(start, start + 999);
        if (result.error) throw result.error;
        candidates.push(...(result.data || []));
        if (!result.data || result.data.length < 1000) break;
      }
      ({ data, count } = selectDiscountedPage(candidates, { deals: onlyDeals, sort: sortField, order, offset, limit: pageSize }));
    } else {
      const result = await query.range(offset, offset + pageSize - 1);
      if (result.error) throw result.error;
      ({ data, count } = result);
    }

    res.json({
      products: data,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
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
      .in("category", await visibleCategorySlugs())
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ products: data });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/brands , distinct brand list ─────────────────────────
productRoutes.get("/brands", async (_req, res, next) => {
  try {
    const visible = await visibleCategorySlugs();
    const brandCounts = {};
    const specs = { processor: new Map(), ram: new Map(), storage: new Map() };
    // Page through the catalog so facet counts are not capped by the API row limit.
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("products").select("brand, specs")
        .eq("is_active", true).in("category", visible).order("id").range(offset, offset + 999);
      if (error) throw error;
      for (const product of data || []) {
        if (product.brand) brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
        for (const key of Object.keys(specs)) {
          const value = product.specs?.[key];
          if ((typeof value === 'string' && value.trim()) || (typeof value === 'number' && Number.isFinite(value) && value > 0)) {
            const text = String(value);
            specs[key].set(text, (specs[key].get(text) || 0) + 1);
          }
        }
      }
      if (!data || data.length < 1000) break;
    }
    const brands = Object.keys(brandCounts).sort();
    res.json({ brands, brandCounts, specifications: Object.fromEntries(Object.entries(specs).map(([key, values]) =>
      [key, [...values].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([value, count]) => ({ value, count }))])) });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/suggest?q= , search autocomplete (max 8) ─────────────
productRoutes.get("/suggest", async (req, res, next) => {
  try {
    const q = sanitizeSearch(req.query.q || "");
    if (!q) return res.json({ products: [] });

    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, description, brand, price, thumbnail_url, images, category, condition_type, condition_grade")
      .eq("is_active", true)
      .in("category", await visibleCategorySlugs())
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order("is_featured", { ascending: false })
      .limit(8);

    if (error) throw error;
    res.json({ products: data || [] });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/products/:slug , single product by slug ───────────────────────
productRoutes.get("/:slug", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("is_active", true)
      .in("category", await visibleCategorySlugs())
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Related products: same category first, then same parent category
    const categorySlugs = await getCategoryWithDescendants(data.category);
    const { data: related } = await supabase
      .from("products")
      .select("id, name, slug, price, images, thumbnail_url, condition_grade, condition_type, brand, category, description")
      .eq("is_active", true)
      .in("category", await visibleCategorySlugs())
      .in("category", categorySlugs)
      .neq("id", data.id)
      .limit(4);

    res.json({ product: data, related: related || [] });
  } catch (err) {
    next(err);
  }
});
