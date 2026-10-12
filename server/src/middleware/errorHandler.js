export function errorHandler(err, _req, res, _next) {
  console.error("❌ Error:", err.message || err);

  const status = err.code === "LIMIT_FILE_SIZE" ? 400 : err.status || 500;
  res.status(status).json({
    error: err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5 MB)" : err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
