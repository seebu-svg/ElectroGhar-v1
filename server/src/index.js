import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { testConnection } from "./config/supabase.js";
import { productRoutes } from "./routes/products.js";
import { categoryRoutes } from "./routes/categories.js";
import { adminRoutes } from "./routes/admin.js";
import { blogRoutes, blogCategoryRoutes } from "./routes/blogs.js";
import { seoRoutes } from "./routes/seo.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

// ── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "ElectroGhar API", timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/blog-categories", blogCategoryRoutes);
app.use(seoRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server (async — tests Supabase first) ─────────────────────────────
async function start() {
  console.log("\n⚡ ElectroGhar API starting...\n");

  const dbOk = await testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   Public:  http://localhost:${PORT}/api/products`);
    console.log(`   Blogs:   http://localhost:${PORT}/api/blogs`);
    console.log(`   Admin:   http://localhost:${PORT}/api/admin/login\n`);

    if (!dbOk) {
      console.log("⚠️  Server is running but Supabase is NOT connected.");
      console.log("   Fix your .env file and restart.\n");
    }
  });
}

start();
