import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const productRoutes = Router();

// ── GET /api/products — list with search, filter, sort, pagination ─────────
productRoutes.get("/", async (req, res, next) => {
  try {
    const {
      search = "",
      brand,
      category,
      minPrice,
      maxPrice,
      condition,
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

    // Search
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filters
    if (brand) query = query.eq("brand", brand);
    if (category) query = query.eq("category", category);
    if (condition) query = query.eq("condition_grade", condition);
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

    // Fetch related products (same category, exclude current)
    const { data: related } = await supabase
      .from("products")
      .select("id, name, slug, price, images, condition_grade, brand")
      .eq("is_active", true)
      .eq("category", data.category)
      .neq("id", data.id)
      .limit(4);

    res.json({ product: data, related: related || [] });
  } catch (err) {
    next(err);
  }
});
