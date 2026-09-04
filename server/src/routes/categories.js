import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const categoryRoutes = Router();

// ── GET /api/categories — all categories with product counts ────────────────
categoryRoutes.get("/", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Attach product count per category
    const categoriesWithCounts = await Promise.all(
      (data || []).map(async (cat) => {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true)
          .eq("category", cat.slug);

        return { ...cat, product_count: count || 0 };
      })
    );

    res.json({ categories: categoriesWithCounts });
  } catch (err) {
    next(err);
  }
});
