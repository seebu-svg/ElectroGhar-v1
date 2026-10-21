import { adminFetch } from "../../utils/adminFetch";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/api";
import { formatPrice, conditionColor } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.webp";

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  function fetchProducts(q = "") {
    setLoading(true);
    adminFetch(`${API_BASE}/admin/products?search=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then((res) => setProducts(res.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchProducts();
  }, [user.token]);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminFetch(`${API_BASE}/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-content">Products</h1>
          <p className="text-sm text-muted">
            {products.length} laptop{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-action text-content text-sm font-semibold hover:bg-action-hover transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search products..."
            defaultValue={search}
            onBlur={(e) => {
              setSearch(e.target.value);
              fetchProducts(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(e.target.value);
                fetchProducts(e.target.value);
              }
            }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-control bg-surface-card text-content text-sm focus:outline-none focus:ring-2 focus:ring-control"
          />
        </div>
        <div className="flex rounded-lg border border-line overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-sm ${view === "grid" ? "bg-action text-content" : "bg-surface-card text-muted hover:bg-surface"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-sm ${view === "list" ? "bg-action text-content" : "bg-surface-card text-muted hover:bg-surface"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted mb-2">No products found.</p>
          <Link to="/admin/products/new" className="text-brand-300 font-semibold text-sm">
            Add your first product
          </Link>
        </div>
      ) : view === "grid" ? (
        <GridView products={products} onDelete={handleDelete} />
      ) : (
        <ListView products={products} onDelete={handleDelete} />
      )}
    </div>
  );
}

/* ── Grid View ──────────────────────────────────────────────── */
function GridView({ products, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p) => {
        const img = p.thumbnail_url || (Array.isArray(p.images) && p.images[0]) || placeholderImg;
        return (
          <div key={p.id} className="bg-surface-card rounded-xl border border-line overflow-hidden group">
            <div className="aspect-[4/3] bg-surface overflow-hidden relative">
              <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${conditionColor(p.condition_grade)}`}>
                {p.condition_grade}
              </span>
              {!p.is_active && (
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-error/10 text-error">
                  INACTIVE
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-brand-300 font-medium">{p.brand}</p>
              <h3 className="text-sm font-semibold text-content truncate">{p.name}</h3>
              <p className="text-sm font-bold text-content mt-1">{formatPrice(p.price)}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-line">
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-surface text-muted text-xs font-medium hover:bg-action/10 hover:text-brand-300 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id, p.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-surface text-muted text-xs font-medium hover:bg-error/10 hover:text-error transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── List View ──────────────────────────────────────────────── */
function ListView({ products, onDelete }) {
  return (
    <div className="bg-surface-card rounded-xl border border-line overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-line text-left text-xs font-medium text-muted uppercase tracking-wider">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3 hidden sm:table-cell">Brand</th>
            <th className="px-4 py-3 hidden md:table-cell">Condition</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3 hidden lg:table-cell">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((p) => {
            const img = p.thumbnail_url || (Array.isArray(p.images) && p.images[0]) || placeholderImg;
            return (
              <tr key={p.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover bg-surface-card shrink-0" />
                    <span className="font-medium text-content truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">{p.brand}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${conditionColor(p.condition_grade)}`}>
                    {p.condition_grade}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-content">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {p.is_active ? (
                    <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-xs font-medium text-error bg-error/10 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="p-1.5 rounded-lg text-muted hover:bg-action/10 hover:text-brand-300 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-muted hover:bg-error/10 hover:text-error transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
