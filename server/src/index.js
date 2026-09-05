import { app } from "./app.js";
import { testConnection } from "./config/supabase.js";

const PORT = process.env.PORT || 5000;

// ── Start Server (async — tests Supabase first) ─────────────────────────────
async function start() {
  console.log("\n⚡ ElectroGhar API starting...\n");

  const dbOk = await testConnection();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Health:  http://localhost:${PORT}/api/health`);
    console.log(`   Public:  http://localhost:${PORT}/api/products`);
    console.log(`   Blogs:   http://localhost:${PORT}/api/blogs`);
    console.log(`   Admin:   http://localhost:${PORT}/api/admin/login\n`);

    if (!dbOk) {
      console.log("⚠️  Server is running but Supabase is NOT connected.");
      console.log("   Fix your .env file and restart.\n");
    }
  });
}

start();
