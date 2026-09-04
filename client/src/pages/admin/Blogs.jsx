import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CloudUpload,
  Eye,
  FolderOpen,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Star,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.png";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
];

export default function AdminBlogs() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showCats, setShowCats] = useState(false);

  const authHeaders = { Authorization: `Bearer ${user.token}` };

  function fetchBlogs(q = "", st = "") {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (st) params.set("status", st);
    fetch(`/api/admin/blogs?${params}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((res) => setBlogs(res.blogs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.token]);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function togglePublish(blog) {
    setBusyId(blog.id);
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}/publish`, {
        method: "PATCH",
        headers: { ...authHeaders, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBlogs((prev) => prev.map((b) => (b.id === blog.id ? data.blog : b)));
    } catch (err) {
      alert("Publish toggle failed: " + err.message);
    } finally {
      setBusyId(null);
    }
  }

  const publishedCount = blogs.filter((b) => b.is_published).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500">
            {blogs.length} post{blogs.length !== 1 ? "s" : ""} · {publishedCount} published
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCats((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
              showCats
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {showCats ? <X className="w-4 h-4" /> : <FolderOpen className="w-4 h-4" />}
            {showCats ? "Close Categories" : "Manage Categories"}
          </button>
          <Link
            to="/admin/blogs/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Blog
          </Link>
        </div>
      </div>

      {/* ── Category manager ──────────────────────────────────── */}
      {showCats && <CategoryManager authHeaders={authHeaders} />}

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row sm:items-center gap-3 mb-5 ${showCats ? "mt-6" : ""}`}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts by title or author..."
            defaultValue={search}
            onBlur={(e) => {
              setSearch(e.target.value);
              fetchBlogs(e.target.value, status);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(e.target.value);
                fetchBlogs(e.target.value, status);
              }
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setStatus(t.value);
                fetchBlogs(search, t.value);
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                status === t.value
                  ? "bg-brand-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Posts table ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-2">No blog posts found.</p>
          <Link to="/admin/blogs/new" className="text-brand-600 font-semibold text-sm">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Post</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stats</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((b) => (
                  <BlogRow
                    key={b.id}
                    blog={b}
                    busy={busyId === b.id}
                    onDelete={handleDelete}
                    onTogglePublish={togglePublish}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Table row ─────────────────────────────────────────────────── */
function BlogRow({ blog, busy, onDelete, onTogglePublish }) {
  const img = blog.cover_image || placeholderImg;
  return (
    <tr className={`hover:bg-gray-50 transition-colors ${busy ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={img}
            alt=""
            className="w-14 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate max-w-[280px] flex items-center gap-1.5">
              {blog.title}
              {blog.is_featured && (
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" title="Featured" />
              )}
            </p>
            <p className="text-xs text-gray-500">
              {blog.author} · {formatDate(blog.published_at || blog.created_at)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-600">
        <span className="capitalize">{(blog.category || "—").replace(/-/g, " ")}</span>
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {blog.views || 0}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onTogglePublish(blog)}
          disabled={busy}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors inline-flex items-center gap-1 ${
            blog.is_published
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
          title={blog.is_published ? "Click to unpublish" : "Click to publish"}
        >
          <CloudUpload className="w-3 h-3" />
          {blog.is_published ? "Published" : "Draft"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Link
            to={`/admin/blogs/${blog.id}/edit`}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(blog.id, blog.title)}
            disabled={busy}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Blog categories manager ──────────────────────────────────── */
function CategoryManager({ authHeaders }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function fetchCats() {
    setLoading(true);
    fetch("/api/admin/blog-categories", { headers: authHeaders })
      .then((r) => r.json())
      .then((res) => setCats(res.categories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchCats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");
      setCats((prev) => [...prev, data.category]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(cat) {
    const count = cat.post_count || 0;
    const msg = count
      ? `Delete "${cat.name}"? ${count} post(s) will lose their category.`
      : `Delete "${cat.name}"?`;
    if (!confirm(msg)) return;
    try {
      await fetch(`/api/admin/blog-categories/${cat.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      setCats((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-brand-500" /> Blog Categories
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Add form */}
        <form onSubmit={addCategory} className="space-y-3 lg:col-span-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name (e.g. Repair Guides)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Add Category
          </button>
        </form>

        {/* List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
            </div>
          ) : cats.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No categories yet — add the first one.</p>
          ) : (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {cats.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-sm">
                      /{c.slug} · {c.post_count || 0} post{(c.post_count || 0) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteCategory(c)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
