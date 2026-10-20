import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { adminRoutes } from "./routes/admin.js";
import { blogRoutes, blogCategoryRoutes } from "./routes/blogs.js";
import { pageRoutes } from "./routes/pages.js";
import { seoRoutes } from "./routes/seo.js";
import { uploadRoutes } from "./routes/upload.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { catalogAdminRoutes } from "./routes/catalogAdmin.js";
import { supabase } from "./config/supabase.js";

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: { directives: {
  "script-src": ["'self'"], "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "https://fonts.gstatic.com"], "img-src": ["'self'", "data:", "https:"],
  "connect-src": ["'self'", "https:"], "frame-src": ["https://www.google.com"],
} } }));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim())
  : ["*"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ElectroGhar API", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", catalogAdminRoutes);
app.get("/api/logo", async (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  try {
    const { data, error } = await supabase.storage.from('uploads').list('branding', { search: 'logo', limit: 100 });
    if (error) throw error;
    const logo = data.find(item => item.name === 'logo');
    if (!logo) return res.json({ url: null });
    const { data: publicUrl } = supabase.storage.from('uploads').getPublicUrl('branding/logo');
    res.json({ url: `${publicUrl.publicUrl}?v=${encodeURIComponent(logo.updated_at || logo.id)}` });
  } catch (error) { next(error); }
});
app.get("/api/hero-images", async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from("hero_images").select("*").eq("is_active", true).order("sort_order");
    // Older databases can serve the default homepage hero until the upgrade runs.
    if (error?.code === "PGRST205" || error?.code === "42P01") {
      return res.json({ images: [] });
    }
    if (error) throw error;
    res.json({ images: data });
  } catch (error) { next(error); }
});
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use("/api/upload", uploadRoutes);
app.use(seoRoutes);
app.use(pageRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

export { app };
