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

    req.user = data.user;
    next();
  } catch (err) {
    next(err);
  }
}
