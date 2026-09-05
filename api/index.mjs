export default async function handler(req, res) {
  try {
    const { app } = await import("../server/src/app.js");
    return app(req, res);
  } catch (err) {
    console.error("Failed to start API:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Internal server error" }));
  }
}
