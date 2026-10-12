import { Router } from "express";
import { supabase, supabaseAuth } from "../config/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

export const adminRoutes = Router();

/** Slugify a title into a URL-safe slug (blogs + blog categories) */
function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[’'"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ensure the generated slug is unique in a table, appending -2, -3, … if taken */
async function uniqueSlug(table, base, exceptId = null) {
  const { data } = await supabase.from(table).select("id, slug").ilike("slug", `${base}%`);
  const taken = new Set(
    (data || []).filter((r) => r.id !== exceptId).map((r) => r.slug)
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

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
    const [prodRes, featRes, catRes, blogRes, pubBlogRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("blogs").select("id", { count: "exact", head: true }),
      supabase.from("blogs").select("id", { count: "exact", head: true }).eq("is_published", true),
    ]);

    res.json({
      totalProducts: prodRes.count || 0,
      featuredProducts: featRes.count || 0,
      totalCategories: catRes.count || 0,
      totalBlogs: blogRes.count || 0,
      publishedBlogs: pubBlogRes.count || 0,
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
    const body = { ...req.body };
    if (!body.name) return res.status(400).json({ error: "Product name is required" });
    
    // Auto-generate slug from name
    body.slug = await uniqueSlug("products", slugify(body.name));

    const { data, error } = await supabase
      .from("products")
      .insert(body)
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
    const body = { ...req.body };
    delete body.id;
    delete body.created_at;
    
    // If name changed, regenerate slug
    if (body.name) {
      body.slug = await uniqueSlug("products", slugify(body.name), req.params.id);
    }

    const { data, error } = await supabase
      .from("products")
      .update(body)
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

// ════════════════════════════════════════════════════════════════════════════
// BLOGS — admin management
// ════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/blogs — all posts (incl. drafts) with search + pagination ─
adminRoutes.get("/blogs", requireAdmin, async (req, res, next) => {
  try {
    const { search = "", status = "", page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from("blogs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    const q = String(search).replace(/[%_,()\\]/g, " ").trim();
    if (q) {
      query = query.or(`title.ilike.%${q}%,author.ilike.%${q}%`);
    }
    if (status === "published") query = query.eq("is_published", true);
    if (status === "draft") query = query.eq("is_published", false);

    const { data, error, count } = await query.range(offset, offset + Number(limit) - 1);
    if (error) throw error;

    res.json({
      blogs: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit)) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/blogs/:id — single post for the edit form ─────────────────
adminRoutes.get("/blogs/:id", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Blog not found" });
    res.json({ blog: data });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/blogs — create ──────────────────────────────────────────
adminRoutes.post("/blogs", requireAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.title) return res.status(400).json({ error: "Title is required" });

    body.slug = await uniqueSlug("blogs", body.slug ? slugify(body.slug) : slugify(body.title));

    // First publish stamps published_at
    if (body.is_published && !body.published_at) {
      body.published_at = new Date().toISOString();
    }
    if (Array.isArray(body.tags) === false && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from("blogs")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ blog: data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/blogs/:id — update ──────────────────────────────────────
adminRoutes.put("/blogs/:id", requireAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body.created_at;
    delete body.views;

    // Keep the slug stable once set — only re-slugify if explicitly provided
    if (body.slug) body.slug = await uniqueSlug("blogs", slugify(body.slug), req.params.id);

    // Stamp published_at on the first publish transition
    if (body.is_published) {
      const { data: current } = await supabase
        .from("blogs")
        .select("is_published, published_at")
        .eq("id", req.params.id)
        .maybeSingle();
      if (current && !current.is_published && !current.published_at) {
        body.published_at = new Date().toISOString();
      }
    }
    if (Array.isArray(body.tags) === false && typeof body.tags === "string") {
      body.tags = body.tags.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const { data, error } = await supabase
      .from("blogs")
      .update(body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ blog: data });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/admin/blogs/:id/publish — toggle publish state ───────────────
adminRoutes.patch("/blogs/:id/publish", requireAdmin, async (req, res, next) => {
  try {
    const { data: current, error: fetchErr } = await supabase
      .from("blogs")
      .select("is_published, published_at")
      .eq("id", req.params.id)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!current) return res.status(404).json({ error: "Blog not found" });

    const next = !current.is_published;
    const patch = { is_published: next };
    if (next && !current.published_at) {
      patch.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("blogs")
      .update(patch)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ blog: data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/blogs/:id ─────────────────────────────────────────────
adminRoutes.delete("/blogs/:id", requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/blog-categories ──────────────────────────────────────────
adminRoutes.get("/blog-categories", requireAdmin, async (_req, res, next) => {
  try {
    const [{ data: cats, error: catErr }, { data: blogs, error: blogErr }] = await Promise.all([
      supabase.from("blog_categories").select("*").order("sort_order", { ascending: true }),
      supabase.from("blogs").select("category"),
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

// ── POST /api/admin/blog-categories ─────────────────────────────────────────
adminRoutes.post("/blog-categories", requireAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.name) return res.status(400).json({ error: "Name is required" });
    body.slug = await uniqueSlug("blog_categories", body.slug ? slugify(body.slug) : slugify(body.name));

    const { data, error } = await supabase
      .from("blog_categories")
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ category: data });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/admin/blog-categories/:id ──────────────────────────────────────
adminRoutes.put("/blog-categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const body = { ...req.body };
    delete body.id;
    delete body.created_at;
    delete body.post_count;
    if (body.slug) body.slug = await uniqueSlug("blog_categories", slugify(body.slug), req.params.id);

    const { data, error } = await supabase
      .from("blog_categories")
      .update(body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ category: data });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/blog-categories/:id ───────────────────────────────────
adminRoutes.delete("/blog-categories/:id", requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from("blog_categories")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN USER MANAGEMENT
// ════════════════════════════════════════════════════════════════════════════

// ── POST /api/admin/change-password ────────────────────────────────────────
adminRoutes.post("/change-password", requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    // Verify current password
    const { data: signInData, error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: req.user.email,
      password: currentPassword,
    });

    if (signInError || !signInData.user) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update to new password using service role
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword }
    );

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/admin/users ───────────────────────────────────────────────────
adminRoutes.get("/users", requireAdmin, async (_req, res, next) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;

    const users = (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }));

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/admin/users ──────────────────────────────────────────────────
adminRoutes.post("/users", requireAdmin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/admin/users/:id ────────────────────────────────────────────
adminRoutes.delete("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own account" });
    }

    const { error } = await supabase.auth.admin.deleteUser(req.params.id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
