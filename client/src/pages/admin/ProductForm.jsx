import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Save } from "lucide-react";
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
  whatsapp_number: "+923001234567",
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
          <Field label="Slug *">
            <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} placeholder="dell-latitude-7420-i7-16gb" />
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
          <Field label="Thumbnail URL">
            <input value={form.thumbnail_url} onChange={(e) => set("thumbnail_url", e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
          {form.images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={url}
                onChange={(e) => updateImage(i, e.target.value)}
                className={`${inputCls} flex-1`}
                placeholder={`Image URL ${i + 1}`}
              />
              {form.images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImage} className="text-sm text-brand-600 font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add image URL
          </button>
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
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

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
