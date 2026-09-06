import { Router } from "express";
import multer from "multer";
import { supabase } from "../config/supabase.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Multer config — in-memory storage with image validation ──────────────
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
    }
  },
});

// ── Ensure the "uploads" bucket exists ────────────────────────────────────
let bucketChecked = false;
async function ensureBucket() {
  if (bucketChecked) return true;
  
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = (buckets || []).some((b) => b.name === "uploads");
  
  if (!exists) {
    console.log("Creating 'uploads' storage bucket...");
    const { error } = await supabase.storage.createBucket("uploads", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    });
    if (error) {
      console.error("Failed to create bucket:", error.message);
      return false;
    }
    console.log("Bucket 'uploads' created successfully");
  }
  
  bucketChecked = true;
  return true;
}

// ── POST /api/upload — upload a single image ─────────────────────────────
// Body: multipart/form-data with field "image"
// Returns: { url: "https://.../uploads/products/abc-123.jpg" }
router.post("/", requireAdmin, upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Ensure bucket exists
    const bucketOk = await ensureBucket();
    if (!bucketOk) {
      return res.status(500).json({ error: "Storage bucket not available. Check Supabase permissions." });
    }

    const folder = req.query.folder || "misc"; // e.g. "products" or "blogs"
    const ext = req.file.originalname.split(".").pop() || "jpg";
    const safeName = req.file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const fileName = `${folder}/${safeName}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return res.status(500).json({ error: error.message || "Failed to upload image" });
    }

    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);

    res.json({ url: urlData.publicUrl, path: data.path });
  } catch (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large (max 5 MB)" });
      }
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
});

// ── DELETE /api/upload — delete an image by path ─────────────────────────
// Body: { path: "products/laptop-abc-123.jpg" }
router.delete("/", requireAdmin, async (req, res, next) => {
  try {
    const { path: filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "Missing file path" });
    }

    const { error } = await supabase.storage
      .from("uploads")
      .remove([filePath]);

    if (error) {
      console.error("Supabase storage delete error:", error);
      return res.status(500).json({ error: "Failed to delete image" });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export { router as uploadRoutes };
