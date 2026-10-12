import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const categoryRoutes = Router();

// ── GET /api/categories — flat list + hierarchy tree + product counts ─────
categoryRoutes.get("/", async (_req, res, next) => {
  try {
    const [catRes, prodRes] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("products")
        .select("category")
        .eq("is_active", true),
    ]);

    if (catRes.error) throw catRes.error;

    // Direct product count per category slug
    const counts = {};
    (prodRes.data || []).forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const flat = (catRes.data || []).map((c) => ({
      ...c,
      product_count: counts[c.slug] || 0,
    }));

    // Build tree (children attached to parents)
    const byId = new Map(flat.map((c) => [c.id, { ...c, children: [] }]));
    const tree = [];
    for (const node of byId.values()) {
      if (node.parent_id && byId.has(node.parent_id)) {
        byId.get(node.parent_id).children.push(node);
      } else {
        tree.push(node);
      }
    }

    // Roll up counts: parent's total includes all descendants
    const rollup = (node) => {
      let total = node.product_count;
      node.children.forEach((child) => {
        total += rollup(child);
      });
      node.total_count = total;
      return total;
    };
    tree.forEach(rollup);

    res.json({ categories: flat, tree });
  } catch (err) {
    next(err);
  }
});
