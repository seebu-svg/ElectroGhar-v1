import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const blogRoutes = Router();
export const blogCategoryRoutes = Router();

/** Sanitize a search term for PostgREST ilike filters */
function sanitizeSearch(term) {
  return String(term).replace(/[%_,()\\]/g, " ").trim();
}

/** Estimated reading time at ~200 wpm, min 1 minute */
function readingMinutes(content) {
  const words = String(content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Shape a blog row for the public API */
function toPublicBlog(b) {
  return { ...b, read_time: readingMinutes(b.content) };
}

// ── GET /api/blogs — published list with search/filter/sort/pagination ──────
blogRoutes.get("/", async (req, res, next) => {
  try {
    const {
      search = "",
      category,
      tag,
      featured,
      sort = "published_at",
      order = "desc",
      page = 1,
      limit = 9,
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .eq("is_published", true);

    // Multi-word search — words are ANDed across title, excerpt and content
    const q = sanitizeSearch(search);
    if (q) {
      q.split(/\s+/)
        .filter(Boolean)
        .slice(0, 4)
        .forEach((word) => {
          query = query.or(`title.ilike.%${word}%,excerpt.ilike.%${word}%,content.ilike.%${word}%`);
        });
    }

    if (category) query = query.eq("category", category);
    if (featured) query = query.eq("is_featured", String(featured) === "1" || featured === "true");
    if (tag) query = query.ilike("tags", `%"${tag}"%`);

    // Whitelist sortable columns (never trust client input in .order)
    const SORTABLE = ["published_at", "created_at", "views", "title"];
    const sortCol = SORTABLE.includes(sort) ? sort : "published_at";
    query = query.order(sortCol, { ascending: order === "asc" })
      // Secondary order keeps lists stable when sort values collide
      .order("created_at", { ascending: false });

    const { data, error, count } = await query.range(offset, offset + Number(limit) - 1);
    if (error) throw error;

    res.json({
      blogs: (data || []).map(toPublicBlog),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.max(1, Math.ceil((count || 0) / Number(limit))),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blogs/featured — latest featured published post ────────────────
blogRoutes.get("/featured", async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("is_published", true)
      .eq("is_featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json({ blog: data ? toPublicBlog(data) : null });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blogs/:slug — single published post (+ related, + view count) ──
blogRoutes.get("/:slug", async (req, res, next) => {
  try {
    const { data: blog, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("slug", req.params.slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Count the visit (fire-and-forget; failure is not a request failure)
    supabase
      .from("blogs")
      .update({ views: (blog.views || 0) + 1 })
      .eq("id", blog.id)
      .then(() => {}, () => {});

    // Related posts — same category first, then anything recent
    let related = [];
    if (blog.category) {
      const { data: sameCat } = await supabase
        .from("blogs")
        .select("id, slug, title, excerpt, cover_image, category, published_at, author, views")
        .eq("is_published", true)
        .eq("category", blog.category)
        .neq("id", blog.id)
        .order("published_at", { ascending: false })
        .limit(3);
      related = sameCat || [];
    }
    if (related.length < 3) {
      const { data: fallback } = await supabase
        .from("blogs")
        .select("id, slug, title, excerpt, cover_image, category, published_at, author, views")
        .eq("is_published", true)
        .neq("id", blog.id)
        .order("published_at", { ascending: false })
        .limit(3 + related.length);
      const seen = new Set(related.map((r) => r.id));
      related = [...related, ...(fallback || []).filter((r) => !seen.has(r.id))].slice(0, 3);
    }

    res.json({ blog: toPublicBlog(blog), related });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/blog-categories — categories with published post counts ────────
blogCategoryRoutes.get("/", async (_req, res, next) => {
  try {
    const [{ data: cats, error: catErr }, { data: blogs, error: blogErr }] = await Promise.all([
      supabase.from("blog_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("blogs").select("category").eq("is_published", true),
    ]);
    if (catErr) throw catErr;
    if (blogErr) throw blogErr;

    const counts = {};
    (blogs || []).forEach((b) => {
      if (b.category) counts[b.category] = (counts[b.category] || 0) + 1;
    });

    res.json({
      categories: (cats || []).map((c) => ({ ...c, post_count: counts[c.slug] || 0 })),
    });
  } catch (err) {
    next(err);
  }
});
