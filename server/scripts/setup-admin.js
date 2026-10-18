import { randomBytes } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const serverEnv = fileURLToPath(new URL("../.env", import.meta.url));
const credentialsFile = fileURLToPath(new URL("../.env.admin.local", import.meta.url));
dotenv.config({ path: serverEnv, quiet: true });
if (existsSync(credentialsFile)) dotenv.config({ path: credentialsFile, quiet: true });

async function setupAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env first.");
  const email = (process.env.ADMIN_EMAIL || "admin@electroghar.pk").trim().toLowerCase();
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Pagination prevents accidentally trying to recreate an existing account.
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const existing = data.users.find((user) => user.email?.toLowerCase() === email);
    if (existing) {
      const { error: roleError } = await admin.auth.admin.updateUserById(existing.id, { app_metadata: { ...existing.app_metadata, role: "admin" } });
      if (roleError) throw roleError;
      console.log(`Admin account ${email} already exists; its password was preserved.`);
      return;
    }
    if (data.users.length < 100) break;
  }

  const password = process.env.ADMIN_PASSWORD || randomBytes(24).toString("base64url");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  if (!process.env.ADMIN_PASSWORD) {
    // Keep the generated password recoverable without logging it or committing it.
    writeFileSync(credentialsFile, `ADMIN_EMAIL=${email}\nADMIN_PASSWORD=${password}\n`, { mode: 0o600, flag: "wx" });
  }
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: "admin" } });
  if (error) throw error;
  console.log(`Created confirmed admin account: ${email}`);
  if (!process.env.ADMIN_PASSWORD) console.log(`Credentials saved to ${credentialsFile}`);

  const auth = createClient(url, process.env.SUPABASE_ANON_KEY || key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error: loginError } = await auth.auth.signInWithPassword({ email, password });
  if (loginError) throw loginError;
  if (!data.session?.access_token) throw new Error("Login did not return an access token.");
  console.log("Verified admin password login successfully.");
  await auth.auth.signOut();
}

setupAdmin().catch((error) => {
  console.error(`Admin setup failed: ${error.message}`);
  process.exitCode = 1;
});
