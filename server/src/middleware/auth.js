import { supabaseAuth } from "../config/supabase.js";

/**
 * Middleware — verifies Supabase JWT and attaches user to req.
 * Rejects with 401 if token is missing or invalid.
 */
export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = header.split(" ")[1];
    const { data, error } = await supabaseAuth.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    if (!isAdmin(data.user)) return res.status(403).json({ error: "Administrator permission required" });
    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
}

export function isAdmin(user) { return user?.app_metadata?.role === "admin"; }

export const MAIN_ADMIN_EMAIL = "admin@electroghar.pk";
export function isMainAdmin(user) {
  return isAdmin(user) && user?.email?.toLowerCase() === MAIN_ADMIN_EMAIL;
}

export function requireMainAdmin(req, res, next) {
  if (!isMainAdmin(req.user)) {
    return res.status(403).json({ error: "Only the main administrator can manage admin accounts" });
  }
  next();
}
