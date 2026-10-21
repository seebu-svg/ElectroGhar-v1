import { adminFetch } from "../../utils/adminFetch";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Star, FolderOpen, PlusCircle, FileText, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.token]);

  const cards = stats
    ? [
        { icon: Package, label: "Total Products", value: stats.totalProducts, color: "bg-action/10 text-brand-300" },
        { icon: Star, label: "Featured", value: stats.featuredProducts, color: "bg-action/10 text-brand-300" },
        { icon: FolderOpen, label: "Categories", value: stats.totalCategories, color: "bg-action/10 text-brand-300" },
        { icon: FileText, label: "Blog Posts", value: stats.totalBlogs, color: "bg-action/10 text-brand-300", to: "/admin/blogs" },
        { icon: FileText, label: "Published Blogs", value: stats.publishedBlogs, color: "bg-purple-50 text-purple-600", to: "/admin/blogs" },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-content">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">Welcome back, {user.email}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {cards.map(({ icon: Icon, label, value, color, to }) => {
              const inner = (
                <div
                  className={`bg-surface-card rounded-xl border border-line p-5 flex items-center gap-4 ${
                    to ? "hover:border-brand-300 hover:shadow-sm transition-all" : ""
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-content">{value}</p>
                    <p className="text-xs text-muted">{label}</p>
                  </div>
                </div>
              );
              return to ? (
                <Link key={label} to={to} className="block">
                  {inner}
                </Link>
              ) : (
                <div key={label}>{inner}</div>
              );
            })}
          </div>

          {/* Quick actions */}
          <h2 className="text-lg font-bold text-content mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 bg-surface-card rounded-xl border border-line p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-action/10 flex items-center justify-center group-hover:bg-action/10 transition-colors">
                <PlusCircle className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content">Add New Laptop</p>
                <p className="text-xs text-muted">Create a new product listing</p>
              </div>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 bg-surface-card rounded-xl border border-line p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-action/10 flex items-center justify-center group-hover:bg-action/10 transition-colors">
                <Package className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content">Manage Products</p>
                <p className="text-xs text-muted">Edit, delete or view all laptops</p>
              </div>
            </Link>
            <Link
              to="/admin/blogs/new"
              className="flex items-center gap-3 bg-surface-card rounded-xl border border-line p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-action/10 flex items-center justify-center group-hover:bg-action/10 transition-colors">
                <FileText className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-content">Write a Blog Post</p>
                <p className="text-xs text-muted">Publish guides and tech tips</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
