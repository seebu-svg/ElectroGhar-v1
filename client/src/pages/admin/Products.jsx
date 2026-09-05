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
import placeholderImg from "../../assets/product-placeholder.png";

export default function AdminProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");

  function fetchProducts(q = "") {
    setLoading(true);
    fetch(`${API_BASE}/admin/products?search=${encodeURIComponent(q)}`, {
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
      await fetch(`${API_BASE}/admin/products/${id}`, {
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">
            {products.length} laptop{products.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 text-sm ${view === "grid" ? "bg-brand-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 text-sm ${view === "list" ? "bg-brand-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-2">No products found.</p>
          <Link to="/admin/products/new" className="text-brand-600 font-semibold text-sm">
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
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
            <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
              <img src={img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
              <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${conditionColor(p.condition_grade)}`}>
                {p.condition_grade}
              </span>
              {!p.is_active && (
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  INACTIVE
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-xs text-brand-600 font-medium">{p.brand}</p>
              <h3 className="text-sm font-semibold text-gray-900 truncate">{p.name}</h3>
              <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(p.price)}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 text-xs font-medium hover:bg-brand-50 hover:text-brand-700 transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id, p.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-50 text-gray-700 text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3 hidden sm:table-cell">Brand</th>
            <th className="px-4 py-3 hidden md:table-cell">Condition</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3 hidden lg:table-cell">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((p) => {
            const img = p.thumbnail_url || (Array.isArray(p.images) && p.images[0]) || placeholderImg;
            return (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={img} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.brand}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${conditionColor(p.condition_grade)}`}>
                    {p.condition_grade}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {p.is_active ? (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Active</span>
                  ) : (
                    <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(p.id, p.name)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
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
