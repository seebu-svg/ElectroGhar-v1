import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, ChevronDown, Loader2 } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { api } from "../utils/api";

const SORT_OPTIONS = [
  { value: "created_at.desc", label: "Newest First" },
  { value: "price.asc", label: "Price: Low to High" },
  { value: "price.desc", label: "Price: High to Low" },
  { value: "name.asc", label: "Name: A to Z" },
];

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Read from URL
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSort = searchParams.get("sort") || "created_at.desc";
  const currentPage = Number(searchParams.get("page") || 1);

  // Load filter options
  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.categories || [])).catch(console.error);
    api.getBrands().then((r) => setBrands(r.brands || [])).catch(console.error);
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = currentSort.split(".");
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortField,
        order: sortOrder,
      };
      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;
      if (currentBrand) params.brand = currentBrand;
      if (currentCondition) params.condition = currentCondition;
      if (currentMaxPrice) params.maxPrice = currentMaxPrice;

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentBrand, currentCondition, currentMaxPrice, currentSort, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL params
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  const hasFilters = currentSearch || currentCategory || currentBrand || currentCondition || currentMaxPrice;

  return (
    <div className="bg-surface-alt min-h-screen">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {currentCategory
              ? categories.find((c) => c.slug === currentCategory)?.name || "Laptops"
              : "All Laptops"}
          </h1>
          <p className="text-gray-500 text-sm">
            {pagination.total
              ? `Showing ${products.length} of ${pagination.total} laptops`
              : "Loading..."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Search & Filter Bar ────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search laptops by name, brand..."
              defaultValue={currentSearch}
              onBlur={(e) => updateParam("search", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="appearance-none w-full sm:w-48 px-4 py-2.5 pr-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || hasFilters
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
                {[currentCategory, currentBrand, currentCondition].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter Panel ───────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Category
                </label>
                <select
                  value={currentCategory}
                  onChange={(e) => updateParam("category", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name} ({cat.product_count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Brand
                </label>
                <select
                  value={currentBrand}
                  onChange={(e) => updateParam("brand", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Condition
                </label>
                <select
                  value={currentCondition}
                  onChange={(e) => updateParam("condition", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Active Filter Tags ────────────────────────────── */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentSearch && (
              <FilterTag
                label={`"${currentSearch}"`}
                onRemove={() => updateParam("search", "")}
              />
            )}
            {currentCategory && (
              <FilterTag
                label={categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                onRemove={() => updateParam("category", "")}
              />
            )}
            {currentBrand && (
              <FilterTag label={currentBrand} onRemove={() => updateParam("brand", "")} />
            )}
            {currentCondition && (
              <FilterTag label={currentCondition} onRemove={() => updateParam("condition", "")} />
            )}
            {currentMaxPrice && (
              <FilterTag
                label={`Under PKR ${Number(currentMaxPrice).toLocaleString("en-PK")}`}
                onRemove={() => updateParam("maxPrice", "")}
              />
            )}
          </div>
        )}

        {/* ── Product Grid ─────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-2">No laptops found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="text-brand-600 font-semibold text-sm hover:text-brand-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => updateParam("page", String(page))}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? "bg-brand-500 text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-brand-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <WhatsAppFAB />
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
