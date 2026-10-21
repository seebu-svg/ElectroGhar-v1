import { adminFetch } from "../../utils/adminFetch";
import { useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus, Key, Shield, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/api";
import LogoSettings from '../../components/admin/LogoSettings';

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-control bg-surface-card text-content text-sm focus:outline-none focus:ring-2 focus:ring-control";

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Change password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Create admin form
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", confirmPassword: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await adminFetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users || []);
      setCanManageUsers(data.can_manage_users === true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      setPasswordSuccess("Password updated successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    if (newAdmin.password !== newAdmin.confirmPassword) {
      setCreateError("Passwords do not match");
      return;
    }
    if (newAdmin.password.length < 6) {
      setCreateError("Password must be at least 6 characters");
      return;
    }

    setCreating(true);
    try {
      const res = await adminFetch(`${API_BASE}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          email: newAdmin.email,
          password: newAdmin.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      setCreateSuccess(`Admin created: ${data.user.email}`);
      setNewAdmin({ email: "", password: "", confirmPassword: "" });
      loadUsers();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(userId, email) {
    if (!confirm(`Are you sure you want to delete admin "${email}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await adminFetch(`${API_BASE}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete admin");
      setSuccess(`Admin "${email}" deleted successfully`);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-content">Admin Management</h1>
      <LogoSettings />

      {error && (
        <div className="text-sm text-error bg-error/10 rounded-lg px-4 py-2.5 border border-error/40">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-success bg-success/10 rounded-lg px-4 py-2.5 border border-success/40">
          {success}
        </div>
      )}

      {/* ── Change Password ─────────────────────────────────────── */}
      <div className="bg-surface-card rounded-xl border border-line p-5 space-y-4">
        <h2 className="text-sm font-bold text-content uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-brand-300" />
          Change Your Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {passwordError && (
            <div className="text-sm text-error bg-error/10 rounded-lg px-3 py-2 border border-error/40">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="text-sm text-success bg-success/10 rounded-lg px-3 py-2 border border-success/40">
              {passwordSuccess}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className={inputCls}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className={inputCls}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className={inputCls}
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-action text-content text-sm font-semibold hover:bg-action-hover disabled:opacity-50 transition-colors"
          >
            {changingPassword ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Update Password
          </button>
        </form>
      </div>

      {/* ── Create New Admin ────────────────────────────────────── */}
      {canManageUsers && <div className="bg-surface-card rounded-xl border border-line p-5 space-y-4">
        <h2 className="text-sm font-bold text-content uppercase tracking-wider flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand-300" />
          Create New Admin
        </h2>
        <form onSubmit={handleCreateAdmin} className="space-y-4 max-w-md">
          {createError && (
            <div className="text-sm text-error bg-error/10 rounded-lg px-3 py-2 border border-error/40">
              {createError}
            </div>
          )}
          {createSuccess && (
            <div className="text-sm text-success bg-success/10 rounded-lg px-3 py-2 border border-success/40">
              {createSuccess}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              required
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className={inputCls}
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Password</label>
            <input
              type="password"
              required
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className={inputCls}
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={newAdmin.confirmPassword}
              onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
              className={inputCls}
              placeholder="Re-enter password"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-action text-content text-sm font-semibold hover:bg-action-hover disabled:opacity-50 transition-colors"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Create Admin
          </button>
        </form>
      </div>

      }
      {/* ── Admin Users List ────────────────────────────────────── */}
      <div className="bg-surface-card rounded-xl border border-line p-5 space-y-4">
        <h2 className="text-sm font-bold text-content uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-300" />
          Admin Users ({users.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-muted uppercase tracking-wider border-b border-line">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Created</th>
                <th className="pb-3 pr-4">Last Sign In</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface">
                  <td className="py-3 pr-4 font-medium text-content">
                    {u.email}
                    {u.is_main_admin && <span className="ml-2 text-xs text-brand-300">Main admin · Protected</span>}
                    {u.id === user.id && (
                      <span className="ml-2 text-xs text-brand-300 font-normal">(you)</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted">{formatDate(u.created_at)}</td>
                  <td className="py-3 pr-4 text-muted">{formatDate(u.last_sign_in_at)}</td>
                  <td className="py-3">
                    {canManageUsers && !u.is_main_admin && u.id !== user.id ? (
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Delete admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-muted">{u.is_main_admin ? "Protected account" : "Current user"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
