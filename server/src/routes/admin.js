import { Router } from "express";
import { supabase, supabaseAuth } from "../config/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRoutes = Router();

// ── POST /api/admin/login ──────────────────────────────────────────────────
adminRoutes.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/stats ───────────────────────────────────────────────────
adminRoutes.get("/stats", requireAdmin, async (_req, res, next) => {
  try {
    const [prodRes, featRes, catRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
      supabase.from("categories").select("id", { count: "exact", head: true }),
    ]);

    res.json({
      totalProducts: prodRes.count || 0,
      featuredProducts: featRes.count || 0,
      totalCategories: catRes.count || 0,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/products ────────────────────────────────────────────────
adminRoutes.get("/products", requireAdmin, async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    query = query.range(offset, offset + Number(limit) - 1);
    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      products: data,
      pagination: { page: Number(page), limit: Number(limit), total: count, totalPages: Math.ceil(count / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/products ───────────────────────────────────────────────
adminRoutes.post("/products", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/products/:id ────────────────────────────────────────────
adminRoutes.put("/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ product: data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/products/:id ─────────────────────────────────────────
adminRoutes.delete("/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/categories ─────────────────────────────────────────────
adminRoutes.post("/categories", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (err) {
    next(err);
  }
});
