import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Star, FolderOpen, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats", {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.token]);

  const cards = stats
    ? [
        { icon: Package, label: "Total Products", value: stats.totalProducts, color: "bg-blue-50 text-blue-600" },
        { icon: Star, label: "Featured", value: stats.featuredProducts, color: "bg-amber-50 text-amber-600" },
        { icon: FolderOpen, label: "Categories", value: stats.totalCategories, color: "bg-emerald-50 text-emerald-600" },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user.email}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {cards.map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              to="/admin/products/new"
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                <PlusCircle className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Add New Laptop</p>
                <p className="text-xs text-gray-500">Create a new product listing</p>
              </div>
            </Link>
            <Link
              to="/admin/products"
              className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Manage Products</p>
                <p className="text-xs text-gray-500">Edit, delete or view all laptops</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
