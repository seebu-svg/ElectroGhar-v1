const API_BASE = "/api";

/**
 * Fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API Error: ${res.status}`);
  }
  return res.json();
}

// ── Products ──────────────────────────────────────────────────
export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/products?${query}`);
  },
  getProduct: (slug) => fetchApi(`/products/${slug}`),
  getFeaturedProducts: () => fetchApi("/products/featured"),
  getBrands: () => fetchApi("/products/brands"),
  getLatestProducts: (limit = 8) =>
    fetchApi(`/products?sort=created_at&order=desc&limit=${limit}`),

  // ── Categories ──────────────────────────────────────────────
  getCategories: () => fetchApi("/categories"),
};
