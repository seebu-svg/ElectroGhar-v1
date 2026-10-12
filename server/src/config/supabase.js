import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("❌ Missing SUPABASE_URL in .env — get it from Supabase Dashboard → Settings → API");
}

if (!supabaseKey || supabaseKey === "your-service-role-key-here") {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY not configured. Data queries will fail.");
  console.warn("   Get it from: Supabase Dashboard → Settings → API → service_role key\n");
}

// Service-role client — for data operations (bypasses RLS)
export const supabase = createClient(
  supabaseUrl,
  supabaseKey || supabaseAnonKey || "",
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Anon client — for Supabase Auth (login, token verify)
export const supabaseAuth = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : supabase;

/**
 * Test the Supabase connection at startup.
 * Returns true if connected, false otherwise.
 */
export async function testConnection() {
  try {
    const { error } = await supabase.from("categories").select("id").limit(1);
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      console.error("   Check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n");
      return false;
    }
    console.log("✅ Supabase connected successfully");
    return true;
  } catch (err) {
    console.error("❌ Supabase connection error:", err.message);
    return false;
  }
}
