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
      cb(Object.assign(new Error("Only JPEG, PNG, WebP and GIF images are allowed"), { status: 400 }));
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

    const b = req.file.buffer;
    const signatures = {
      'image/jpeg': b[0] === 255 && b[1] === 216 && b[2] === 255,
      'image/png': b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
      'image/gif': ['GIF87a','GIF89a'].includes(b.subarray(0,6).toString()),
      'image/webp': b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WEBP',
    };
    if (!signatures[req.file.mimetype]) return res.status(400).json({ error: 'Image content does not match the selected file format' });
    // Ensure bucket exists
    const bucketOk = await ensureBucket();
    if (!bucketOk) {
      return res.status(500).json({ error: "Storage bucket not available. Check Supabase permissions." });
    }

    const folder = ["products", "blogs", "hero", "misc"].includes(req.query.folder) ? req.query.folder : "misc"; // e.g. "products" or "blogs"
    const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[req.file.mimetype];
    const safeName = req.file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50);
    const replacingLogo = req.query.folder === "logo";
    const fileName = replacingLogo ? "branding/logo" : `${folder}/${safeName}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: replacingLogo,
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      return res.status(500).json({ error: error.message || "Failed to upload image" });
    }

    const { data: urlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(data.path);

    res.json({ url: replacingLogo ? `${urlData.publicUrl}?v=${Date.now()}` : urlData.publicUrl, path: data.path });
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
    if (filePath === 'branding/logo') return res.status(400).json({ error: 'The website logo can only be replaced' });

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
