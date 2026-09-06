import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Save, Upload, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE, api } from "../../utils/api";

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair"];
const CONDITION_TYPES = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

const EMPTY = {
  name: "",
  slug: "",
  description: "",
  brand: "",
  category: "business-laptops",
  condition_type: "used",
  price: "",
  compare_at_price: "",
  condition_grade: "Good",
  battery_health: "",
  warranty: "7-day checking warranty",
  stock_qty: 1,
  is_available: true,
  is_featured: false,
  is_active: true,
  thumbnail_url: "",
  images: [""],
  whatsapp_number: "+92339244435",
  meta_title: "",
  meta_description: "",
  specs: [{ key: "", value: "" }],
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Load product for edit mode
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    // Admin products list has all data; find by id
    fetch(`${API_BASE}/admin/products?limit=200`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((res) => {
        const p = (res.products || []).find((x) => x.id === id);
        if (p) {
          const specs = p.specs
            ? Object.entries(p.specs).map(([key, value]) => ({ key, value }))
            : [{ key: "", value: "" }];
          const images = Array.isArray(p.images) && p.images.length ? p.images : [""];
          setForm({
            ...EMPTY,
            ...p,
            price: p.price ?? "",
            compare_at_price: p.compare_at_price ?? "",
            specs,
            images,
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isEdit, user.token]);

  // Load category tree (grouped by parent category)
  useEffect(() => {
    api
      .getCategories()
      .then((res) => setCategoryTree(res.tree || []))
      .catch(console.error);
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Keep grade consistent with type: "new" type → "New" grade
  function setConditionType(value) {
    setForm((f) => ({
      ...f,
      condition_type: value,
      condition_grade:
        value === "new" ? "New" : f.condition_grade === "New" ? "Good" : f.condition_grade,
    }));
  }

  function addSpec() {
    set("specs", [...form.specs, { key: "", value: "" }]);
  }

  function removeSpec(i) {
    set("specs", form.specs.filter((_, idx) => idx !== i));
  }

  function updateSpec(i, field, val) {
    const next = [...form.specs];
    next[i] = { ...next[i], [field]: val };
    set("specs", next);
  }

  function addImage() {
    set("images", [...form.images, ""]);
  }

  function removeImage(i) {
    set("images", form.images.filter((_, idx) => idx !== i));
  }

  function updateImage(i, val) {
    const next = [...form.images];
    next[i] = val;
    set("images", next);
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadError("");
    setUploading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large (max 5 MB)`);
        }
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          throw new Error(`${file.name} is not a supported format`);
        }

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(`${API_BASE}/upload?folder=products`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");

        uploadedUrls.push(data.url);
      }

      // Add uploaded URLs to images array
      const currentImages = form.images.filter(Boolean);
      set("images", [...currentImages, ...uploadedUrls]);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    // Build payload
    const specsObj = {};
    form.specs.forEach((s) => {
      if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
    });

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : null,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock_qty: Number(form.stock_qty) || 0,
      specs: specsObj,
      images: form.images.filter(Boolean),
      thumbnail_url: form.thumbnail_url || form.images.filter(Boolean)[0] || null,
    };

    try {
      const url = isEdit ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      navigate("/admin/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2.5 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ─────────────────────────────────────── */}
        <Section title="Basic Information">
          <Field label="Product Name *">
            <input required value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} placeholder="Dell Latitude 7420" />
          </Field>
          <Field label="Description" full>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} placeholder="Describe the laptop..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand *">
              <input required value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputCls} placeholder="Dell" />
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
                {categoryTree.map((parent) =>
                  parent.children && parent.children.length > 0 ? (
                    <optgroup key={parent.id} label={parent.name}>
                      {parent.children.map((child) => (
                        <option key={child.id} value={child.slug}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={parent.id} value={parent.slug}>
                      {parent.name}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Pricing ────────────────────────────────────────── */}
        <Section title="Pricing, Stock & Condition">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Price (PKR)">
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={inputCls} placeholder="185000" />
            </Field>
            <Field label="Compare Price">
              <input type="number" value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} className={inputCls} placeholder="220000" />
            </Field>
            <Field label="Stock Qty">
              <input type="number" value={form.stock_qty} onChange={(e) => set("stock_qty", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Condition Type">
              <select value={form.condition_type} onChange={(e) => setConditionType(e.target.value)} className={inputCls}>
                {CONDITION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Condition Grade">
              <select value={form.condition_grade} onChange={(e) => set("condition_grade", e.target.value)} className={inputCls}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Battery Health">
              <input value={form.battery_health} onChange={(e) => set("battery_health", e.target.value)} className={inputCls} placeholder="85%" />
            </Field>
            <Field label="Warranty">
              <input value={form.warranty} onChange={(e) => set("warranty", e.target.value)} className={inputCls} placeholder="7-day checking warranty" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            <Check label="Active" checked={form.is_active} onChange={(v) => set("is_active", v)} />
            <Check label="Featured" checked={form.is_featured} onChange={(v) => set("is_featured", v)} />
            <Check label="Available" checked={form.is_available} onChange={(v) => set("is_available", v)} />
          </div>
        </Section>

        {/* ── Images ─────────────────────────────────────────── */}
        <Section title="Images">
          <div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="product-image-upload"
              />
              <label
                htmlFor="product-image-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 cursor-pointer transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Upload Images"}
              </label>
              <span className="text-xs text-gray-400">Select up to 6 images (max 5 MB each)</span>
            </div>
            {uploadError && (
              <p className="mt-2 text-sm text-red-500">{uploadError}</p>
            )}
          </div>

          {/* Image previews */}
          {form.images.filter(Boolean).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {form.images.filter(Boolean).map((url, i) => (
                <div key={i} className="relative group bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <img
                    src={url}
                    alt={`Product image ${i + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(form.images.indexOf(url))}
                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-brand-500 text-white text-xs rounded-full font-medium">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {form.images.filter(Boolean).length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
              No images uploaded yet. Click "Upload Images" to add product photos.
            </p>
          )}
        </Section>

        {/* ── Specifications ─────────────────────────────────── */}
        <Section title="Specifications">
          {form.specs.map((spec, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className={`${inputCls} w-40`}
                placeholder="Key (e.g. processor)"
              />
              <input
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder="Value (e.g. Intel Core i7)"
              />
              {form.specs.length > 1 && (
                <button type="button" onClick={() => removeSpec(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addSpec} className="text-sm text-brand-600 font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add spec
          </button>
        </Section>

        {/* ── SEO ────────────────────────────────────────────── */}
        <Section title="SEO (optional)">
          <Field label="Meta Title">
            <input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Meta Description" full>
            <textarea rows={2} value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} className={inputCls} />
          </Field>
        </Section>

        {/* ── Submit ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "" : ""}>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
