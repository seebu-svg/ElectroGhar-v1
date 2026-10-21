import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../utils/api";
import SiteLogo from '../../components/ui/SiteLogo';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from?.pathname || "/admin"} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.adminLogin({ email, password });
      login(data.token, data.user, data.refreshToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-surface-dark flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Cinematic layers */}
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute left-1/2 -translate-x-1/2 top-1/4 w-[36rem] h-[36rem] glow-blob pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <SiteLogo alt="ElectroGhar" className="h-20 sm:h-24 w-auto mx-auto mb-4" />
          <h1 className="text-xl font-bold text-content font-heading">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">Sign in to manage your store</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-surface-card rounded-2xl border border-line shadow-2xl shadow-midnight/50 p-6 space-y-5"
        >
          {error && (
            <div className="text-sm text-brand-300 bg-brand-600/10 rounded-lg px-4 py-2.5 border border-brand-600/25">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@electroghar.pk"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-control bg-surface-alt text-sm text-content placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-control focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-control bg-surface-alt text-sm text-content placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-control focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-action text-content font-semibold text-sm hover:bg-action-hover disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
