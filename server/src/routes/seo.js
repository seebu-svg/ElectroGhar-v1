import { Router } from "express";
import { supabase } from "../config/supabase.js";

export const seoRoutes = Router();

function baseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3CDate(iso) {
  if (!iso) return new Date().toISOString();
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ── GET /robots.txt ─────────────────────────────────────────────────────────
seoRoutes.get("/robots.txt", (req, res) => {
  const host = req.get("host");
  res.setHeader("Content-Type", "text/plain");
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${req.protocol}://${host}/sitemap.xml\n`
  );
});

// ── GET /sitemap.xml ────────────────────────────────────────────────────────
seoRoutes.get("/sitemap.xml", async (req, res, next) => {
  try {
    const base = baseUrl(req);
    const today = new Date().toISOString();

    const staticUrls = [
      { loc: `${base}/`, priority: "1.0", changefreq: "daily" },
      { loc: `${base}/products`, priority: "0.9", changefreq: "daily" },
      { loc: `${base}/blogs`, priority: "0.8", changefreq: "weekly" },
      { loc: `${base}/about`, priority: "0.7", changefreq: "monthly" },
      { loc: `${base}/privacy`, priority: "0.3", changefreq: "yearly" },
      { loc: `${base}/terms`, priority: "0.3", changefreq: "yearly" },
    ];

    const [{ data: products }, { data: blogs }, { data: categories }] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("is_active", true),
      supabase.from("blogs").select("slug, updated_at").eq("is_published", true),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true),
    ]);

    const productUrls = (products || []).map((p) => ({
      loc: `${base}/product/${p.slug}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: toW3CDate(p.updated_at),
    }));

    const blogUrls = (blogs || []).map((b) => ({
      loc: `${base}/blogs/${b.slug}`,
      priority: "0.7",
      changefreq: "monthly",
      lastmod: toW3CDate(b.updated_at),
    }));

    const categoryUrls = (categories || []).map((c) => ({
      loc: `${base}/products?category=${encodeURIComponent(c.slug)}`,
      priority: "0.6",
      changefreq: "weekly",
      lastmod: toW3CDate(c.updated_at),
    }));

    const allUrls = [...staticUrls, ...productUrls, ...blogUrls, ...categoryUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
      .map(
        (u) =>
          `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <lastmod>${u.lastmod || today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      )
      .join("\n")}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});
