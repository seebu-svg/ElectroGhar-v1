import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Loader2, Save, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const INPUT_CLS =
  "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

export default function BlogForm() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "",
    author: "ElectroGhar Team",
    author_role: "",
    tags: [],
    is_featured: false,
    is_published: false,
    meta_title: "",
    meta_description: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = { Authorization: `Bearer ${user.token}` };

  // Load categories + existing post (edit mode)
  useEffect(() => {
    fetch("/api/admin/blog-categories", { headers: authHeaders })
      .then((r) => r.json())
      .then((res) => setCategories(res.categories || []))
      .catch(console.error);

    if (isEdit) {
      fetch(`/api/admin/blogs/${id}`, { headers: authHeaders })
        .then((r) => r.json())
        .then((res) => {
          if (res.blog) {
            setForm((prev) => ({
              ...prev,
              ...res.blog,
              tags: Array.isArray(res.blog.tags) ? res.blog.tags : [],
              author_role: res.blog.author_role || "",
            }));
            setTagInput((res.blog.tags || []).join(", "));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.token]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTagsChange(value) {
    setTagInput(value);
    set(
      "tags",
      value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    );
  }

  async function handleSubmit(e, publishNow = null) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content || null,
      cover_image: form.cover_image.trim() || null,
      category: form.category || null,
      author: form.author.trim() || "ElectroGhar Team",
      author_role: form.author_role.trim() || null,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
    };
    if (publishNow !== null) payload.is_published = publishNow;

    try {
      const res = await fetch(isEdit ? `/api/admin/blogs/${id}` : "/api/admin/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.message);
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

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate("/admin/blogs")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Blog Post" : "New Blog Post"}
          </h1>
        </div>
        {isEdit && form.is_published && (
          <a
            href={`/blogs/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:border-brand-300 hover:text-brand-700 transition-colors"
          >
            <Eye className="w-4 h-4" /> View Live
          </a>
        )}
      </div>

      <form onSubmit={(e) => handleSubmit(e, null)} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Main column */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. How to Check Battery Health Before Buying a Used Laptop"
              className={INPUT_CLS}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Excerpt
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="One or two sentences shown on cards and in search results"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Content
              </label>
              <span className="text-xs text-gray-400">
                {wordCount} words · ~{readTime} min read
              </span>
            </div>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={16}
              placeholder={"Write the article here…\n\nBlank line = new paragraph\n## Heading\n### Subheading\n- List item"}
              className={`${INPUT_CLS} font-mono text-[13px] leading-relaxed`}
            />
          </div>
        </div>

        {/* Sidebar-ish settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-5">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Post Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Slug (URL)
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="Auto-generated from title if empty"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="ElectroGhar Team"
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Author Role
              </label>
              <input
                type="text"
                value={form.author_role}
                onChange={(e) => set("author_role", e.target.value)}
                placeholder="e.g. Founder & Lead Technician"
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Cover Image URL
            </label>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => set("cover_image", e.target.value)}
              placeholder="https://images.unsplash.com/…"
              className={INPUT_CLS}
            />
            {form.cover_image && (
              <img
                src={form.cover_image}
                alt="Cover preview"
                className="mt-2.5 w-full max-w-sm aspect-video object-cover rounded-lg border border-gray-200"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="buying guide, battery, used laptops"
              className={INPUT_CLS}
            />
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> SEO
          </h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Meta Title
            </label>
            <input
              type="text"
              value={form.meta_title}
              onChange={(e) => set("meta_title", e.target.value)}
              placeholder={form.title || "Defaults to the post title"}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Meta Description
            </label>
            <textarea
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              rows={2}
              placeholder={form.excerpt || "Defaults to the excerpt"}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pb-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Create Post"}
          </button>
          {!isEdit && (
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:border-brand-300 hover:text-brand-700 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Create & Publish
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            className="px-5 py-2.5 rounded-lg text-gray-500 text-sm font-semibold hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
