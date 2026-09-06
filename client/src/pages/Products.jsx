import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  ArrowUpDown,
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  Cpu,
  Flame,
  HardDrive,
  LayoutGrid,
  Laptop,
  MessageCircle,
  Monitor,
  Search,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import Pagination from "../components/ui/Pagination";
import { api } from "../utils/api";
import { SEOHead, breadcrumbSchema, itemListSchema } from "../utils/seo";

const SORT_OPTIONS = [
  { value: "stock_qty.desc", label: "Most Popular" },
  { value: "created_at.desc", label: "Newest First" },
  { value: "price.asc", label: "Price: Low to High" },
  { value: "price.desc", label: "Price: High to Low" },
  { value: "name.asc", label: "Name: A to Z" },
];

const CONDITIONS = ["New", "Like New", "Excellent", "Good", "Fair"];

const CONDITION_TYPES = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

const CATEGORY_ICONS = {
  laptops: Laptop,
  "pcs-desktops": Cpu,
  "monitors-displays": Monitor,
  "storage-accessories": HardDrive,
  "gadgets-electronics": Zap,
};

const PAGE_LIMIT = 12;

/* Marketplace trust markers shown beside the page title */
const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Quality Checked" },
  { icon: BadgeCheck, label: "Honest Condition" },
  { icon: MessageCircle, label: "WhatsApp Orders" },
];

const SELECT_CLS =
  "w-full px-3 py-2 rounded-lg border border-white/10 bg-surface-card text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors [&>option]:bg-surface-card [&>option]:text-gray-200";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read from URL
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentConditionType = searchParams.get("conditionType") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentFeatured = searchParams.get("featured") || "";
  const currentDeals = searchParams.get("deals") || "";
  const currentSort = searchParams.get("sort") || "stock_qty.desc";
  const currentPage = Number(searchParams.get("page") || 1);

  // Load filter options
  useEffect(() => {
    api.getCategories()
      .then((r) => {
        setCategories(r.categories || []);
        setTree(r.tree || []);
      })
      .catch(console.error);
    api.getBrands().then((r) => setBrands(r.brands || [])).catch(console.error);
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortField, sortOrder] = currentSort.split(".");
      const params = {
        page: currentPage,
        limit: PAGE_LIMIT,
        sort: sortField,
        order: sortOrder,
      };
      if (currentSearch) params.search = currentSearch;
      if (currentCategory) params.category = currentCategory;
      if (currentBrand) params.brand = currentBrand;
      if (currentConditionType) params.conditionType = currentConditionType;
      if (currentCondition) params.condition = currentCondition;
      if (currentMaxPrice) params.maxPrice = currentMaxPrice;
      if (currentFeatured) params.featured = currentFeatured;
      if (currentDeals) params.deals = currentDeals;

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentBrand, currentConditionType, currentCondition, currentMaxPrice, currentFeatured, currentDeals, currentSort, currentPage]);

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
    setShowMobileFilters(false);
  }

  const hasFilters =
    currentSearch || currentCategory || currentBrand || currentConditionType || currentCondition || currentMaxPrice || currentFeatured || currentDeals;

  // Resolve current category display name (child or parent)
  const activeCat = categories.find((c) => c.slug === currentCategory);
  const activeParent = activeCat?.parent_id
    ? categories.find((c) => c.id === activeCat.parent_id)
    : null;

  // Top-level category currently browsed (drives the subcategory chip row)
  const activeTreeCat = tree.find(
    (c) =>
      c.slug === currentCategory ||
      c.children.some((s) => s.slug === currentCategory)
  );

  const pageTitle = activeCat
    ? activeCat.name
    : currentFeatured
      ? "Best Sellers"
      : currentDeals
        ? "Daily Deals"
        : currentSearch
          ? `Search: ${currentSearch}`
          : "All Products";

  const metaDescription = activeCat
    ? `Buy ${activeCat.name} in Pakistan at ElectroGhar. Quality checked, honestly graded, WhatsApp-confirmed pricing. ${pagination.total || 0}+ items in stock.`
    : currentFeatured
      ? "Shop the most popular laptops, PCs, monitors and gadgets at ElectroGhar. Quality checked and WhatsApp-confirmed pricing."
      : currentDeals
        ? "Biggest discounts on quality checked tech at ElectroGhar. Laptops, PCs, monitors and gadgets — while stock lasts."
        : currentSearch
          ? `Search results for "${currentSearch}" at ElectroGhar. Quality checked laptops, PCs, monitors and gadgets.`
          : "Browse all quality checked laptops, PCs, monitors, storage and gadgets at ElectroGhar. New, used and refurbished. Message us on WhatsApp.";

  const canonicalUrl = (() => {
    const base = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";
    if (!currentSearch && !currentCategory && !currentBrand && !currentConditionType && !currentCondition && !currentMaxPrice && !currentFeatured && !currentDeals) {
      return `${base}/products`;
    }
    return `${base}${window.location.pathname}${window.location.search}`;
  })();

  const breadcrumbItems = [{ label: "Products", to: "/products" }];
  if (activeParent) {
    breadcrumbItems.push({ label: activeParent.name, to: `/products?category=${activeParent.slug}` });
  }
  if (activeCat) {
    breadcrumbItems.push({ label: activeCat.name });
  } else if (currentFeatured) {
    breadcrumbItems.push({ label: "Best Sellers" });
  } else if (currentDeals) {
    breadcrumbItems.push({ label: "Daily Deals" });
  } else if (currentSearch) {
    breadcrumbItems.push({ label: `Search: ${currentSearch}` });
  }

  const EyebrowIcon = currentFeatured
    ? TrendingUp
    : currentDeals
      ? Flame
      : currentSearch
        ? Search
        : activeCat
          ? CATEGORY_ICONS[activeTreeCat?.slug] || LayoutGrid
          : LayoutGrid;

  const filterProps = {
    tree,
    brands,
    categories,
    currentCategory,
    currentBrand,
    currentConditionType,
    currentCondition,
    currentMaxPrice,
    updateParam,
    clearFilters,
    hasFilters,
  };

  return (
    <div className="bg-surface-alt min-h-screen">
      <SEOHead
        title={pageTitle}
        description={metaDescription}
        canonical={canonicalUrl}
        type="website"
        jsonLd={[
          breadcrumbSchema(
            breadcrumbItems.map((i) => ({
              label: i.label,
              to: i.to ? `${typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk"}${i.to}` : `${typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk"}/products`,
            }))
          ),
          ...(products.length ? [itemListSchema(products, canonicalUrl)] : []),
        ]}
      />
      {/* ── Compact page header — the grid stays the hero ── */}
      <div className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

        <div className="relative max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            {/* Breadcrumb for subcategory */}
            {activeParent && (
              <nav className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-white/[0.03] border border-white/5 rounded-full px-3 py-1.5 mb-2.5">
                <Link
                  to={`/products?category=${activeParent.slug}`}
                  className="hover:text-brand-400 transition-colors"
                >
                  {activeParent.name}
                </Link>
                <ChevronRight className="w-3 h-3 text-gray-600" />
                <span className="text-gray-300 font-medium">{activeCat.name}</span>
              </nav>
            )}
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-brand-600/15 border border-brand-600/30 flex items-center justify-center shrink-0">
                <EyebrowIcon className="w-4.5 h-4.5 text-brand-500" />
              </span>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
                  {pageTitle}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  {pagination.total
                    ? `${pagination.total} quality-checked ${pagination.total === 1 ? "item" : "items"} — order on WhatsApp`
                    : "Browse the full ElectroGhar catalog"}
                </p>
              </div>
            </div>
          </div>

          {/* Marketplace trust markers */}
          <div className="hidden md:flex items-center gap-5 pb-1">
            {TRUST_ITEMS.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-gray-400">
                <t.icon className="w-4 h-4 text-brand-500" />
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Category navigation tabs ─────────────────────────── */}
        <div className="relative border-t border-white/5 bg-black/20">
          <div className="max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
              <CategoryTab
                label="All Products"
                active={!currentCategory && !currentFeatured && !currentDeals && !currentSearch}
                to="/products"
              />
              {tree.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.slug] || Cpu;
                const active =
                  currentCategory === cat.slug ||
                  cat.children.some((s) => s.slug === currentCategory);
                return (
                  <CategoryTab
                    key={cat.slug}
                    icon={Icon}
                    label={cat.name}
                    count={cat.total_count}
                    active={active}
                    to={`/products?category=${cat.slug}`}
                  />
                );
              })}
              {/* Collections */}
              <span className="w-px h-6 bg-white/10 shrink-0 mx-1" aria-hidden="true" />
              <CategoryTab
                icon={Flame}
                label="Deals"
                active={!!currentDeals}
                to="/products?deals=1"
              />
              <CategoryTab
                icon={TrendingUp}
                label="Best Sellers"
                active={!!currentFeatured}
                to="/products?featured=1"
              />
            </div>
          </div>

          {/* Subcategory chips for the active department */}
          {activeTreeCat && (
            <div className="border-t border-white/5 bg-black/10">
              <div className="max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
                  <SubChip
                    label={`All ${activeTreeCat.name}`}
                    active={currentCategory === activeTreeCat.slug}
                    to={`/products?category=${activeTreeCat.slug}`}
                  />
                  {activeTreeCat.children.map((sub) => (
                    <SubChip
                      key={sub.slug}
                      label={sub.name}
                      count={sub.product_count}
                      active={currentCategory === sub.slug}
                      to={`/products?category=${sub.slug}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          {/* ── Sidebar (desktop) ─────────────────────────────── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 scrollbar-hide">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: results + sort + mobile filters */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-gray-500">
                {loading ? (
                  "Loading results…"
                ) : pagination.total ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-gray-300">
                      {Math.min((currentPage - 1) * PAGE_LIMIT + 1, pagination.total)}–
                      {Math.min(currentPage * PAGE_LIMIT, pagination.total)}
                    </span>{" "}
                    of <span className="font-semibold text-gray-300">{pagination.total}</span>{" "}
                    results
                    {activeCat && (
                      <span className="hidden sm:inline"> in {activeCat.name}</span>
                    )}
                  </>
                ) : (
                  "No results"
                )}
              </p>

              <div className="flex items-center gap-2.5">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className={`lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    hasFilters
                      ? "border-brand-500/50 bg-brand-600/15 text-brand-400 shadow-lg shadow-brand-600/10"
                      : "border-white/10 bg-surface-card text-gray-300 hover:border-white/20"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasFilters && (
                    <span className="w-2 h-2 rounded-full bg-brand-400" />
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                  <select
                    value={currentSort}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="appearance-none pl-9 pr-9 py-2 rounded-lg border border-white/10 bg-surface-card text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors cursor-pointer [&>option]:bg-surface-card [&>option]:text-gray-200"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {currentSearch && (
                  <FilterTag label={`"${currentSearch}"`} onRemove={() => updateParam("search", "")} />
                )}
                {activeCat && (
                  <FilterTag
                    label={activeParent ? `${activeParent.name} › ${activeCat.name}` : activeCat.name}
                    onRemove={() => updateParam("category", "")}
                  />
                )}
                {currentBrand && (
                  <FilterTag label={currentBrand} onRemove={() => updateParam("brand", "")} />
                )}
                {currentConditionType && (
                  <FilterTag
                    label={currentConditionType.charAt(0).toUpperCase() + currentConditionType.slice(1)}
                    onRemove={() => updateParam("conditionType", "")}
                  />
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
                {currentFeatured && (
                  <FilterTag label="Best Sellers" onRemove={() => updateParam("featured", "")} />
                )}
                {currentDeals && (
                  <FilterTag label="Daily Deals" onRemove={() => updateParam("deals", "")} />
                )}
                <button
                  onClick={clearFilters}
                  className="ml-1 text-xs font-semibold text-gray-500 hover:text-brand-400 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1920px]:grid-cols-5 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="bg-surface-card rounded-2xl border border-white/5 overflow-hidden">
                    <div className="aspect-[4/3] bg-surface-dark animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                      <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                      <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className="h-6 bg-white/5 rounded animate-pulse" />
                        <div className="h-6 bg-white/5 rounded animate-pulse" />
                      </div>
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                        <div className="h-10 w-10 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-600/5 border border-brand-600/20 flex items-center justify-center mb-6">
                  <SearchX className="w-8 h-8 text-brand-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-heading">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                  Nothing matches your current filters. Try adjusting your search,
                  widening your budget, or clearing all filters to browse everything.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-brand-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/25"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-[1920px]:grid-cols-5 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} showAskPrice />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                className="mt-8"
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => updateParam("page", String(page))}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ────────────────────────────── */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="relative w-[85%] max-w-sm h-full bg-surface-alt border-r border-white/10 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                Filters
              </h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterPanel {...filterProps} onNavigate={() => setShowMobileFilters(false)} />
          </div>
        </div>
      )}

      <WhatsAppFAB />
    </div>
  );
}

/* ── Category navigation tab ───────────────────────────────────── */
function CategoryTab({ icon: Icon, label, count, active, to }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all shrink-0 min-h-[40px] ${
        active
          ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/25"
          : "bg-surface-card/60 text-gray-400 border-white/10 hover:text-white hover:border-brand-600/40"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {count !== undefined && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            active ? "bg-white/20 text-white" : "bg-white/5 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

/* ── Subcategory chip ──────────────────────────────────────────── */
function SubChip({ label, count, active, to }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-medium border transition-all shrink-0 min-h-[36px] ${
        active
          ? "bg-brand-600/20 text-brand-300 border-brand-600/50"
          : "bg-transparent text-gray-500 border-white/10 hover:text-gray-200 hover:border-white/25"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="text-[10px] text-gray-600">{count}</span>
      )}
    </Link>
  );
}

// ── Filter Sidebar (shared desktop + mobile drawer) ────────────
function FilterPanel({
  tree,
  brands,
  currentCategory,
  currentBrand,
  currentConditionType,
  currentCondition,
  currentMaxPrice,
  updateParam,
  clearFilters,
  hasFilters,
  onNavigate,
}) {
  return (
    <div>
      {/* Panel heading */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
        <span className="w-7 h-7 rounded-lg bg-brand-600/15 border border-brand-600/30 flex items-center justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
        </span>
        <h3 className="text-sm font-bold text-white font-heading">Refine Results</h3>
      </div>

      <div className="mt-3">
        {/* Condition type chips */}
        <FilterGroup title="Condition" active={!!currentConditionType} defaultOpen>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam("conditionType", "")}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                !currentConditionType
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-surface-card text-gray-400 border-white/10 hover:border-brand-600/40 hover:text-white"
              }`}
            >
              All
            </button>
            {CONDITION_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => updateParam("conditionType", currentConditionType === ct.value ? "" : ct.value)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  currentConditionType === ct.value
                    ? "bg-brand-600 text-white border-brand-600"
                    : "bg-surface-card text-gray-400 border-white/10 hover:border-brand-600/40 hover:text-white"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Category tree */}
        <FilterGroup title="Categories" active={!!currentCategory} defaultOpen>
          <div className="space-y-4">
            {tree.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Cpu;
              const isActiveCat = currentCategory === cat.slug;
              return (
                <div key={cat.slug}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    onClick={onNavigate}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                      isActiveCat ? "text-brand-400" : "text-gray-200 hover:text-brand-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                    <span className="text-[10px] text-gray-600 font-normal">({cat.total_count || 0})</span>
                  </Link>
                  <ul className="mt-1.5 ml-6 space-y-0.5 border-l border-white/10 pl-3">
                    {cat.children.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          to={`/products?category=${sub.slug}`}
                          onClick={onNavigate}
                          className={`flex items-center justify-between py-1 text-sm transition-colors ${
                            currentCategory === sub.slug
                              ? "text-brand-400 font-medium"
                              : "text-gray-500 hover:text-gray-200"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="text-[10px] text-gray-600 shrink-0 ml-2">{sub.product_count || 0}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </FilterGroup>

        {/* Brand */}
        <FilterGroup title="Brand" active={!!currentBrand}>
          <select
            value={currentBrand}
            onChange={(e) => updateParam("brand", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FilterGroup>

        {/* Condition grade */}
        <FilterGroup title="Quality Grade" active={!!currentCondition}>
          <select
            value={currentCondition}
            onChange={(e) => updateParam("condition", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Any Grade</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </FilterGroup>

        {/* Max price */}
        <FilterGroup title="Max Price" active={!!currentMaxPrice}>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            <input
              type="number"
              defaultValue={currentMaxPrice}
              onBlur={(e) => updateParam("maxPrice", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateParam("maxPrice", e.target.value)}
              placeholder="e.g. 150000"
              className={`${SELECT_CLS} pl-9`}
              min="0"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[50000, 100000, 200000, 400000].map((p) => (
              <button
                key={p}
                onClick={() => updateParam("maxPrice", String(p))}
                className={`px-3 py-1.5 rounded-md text-[11px] border transition-colors ${
                  currentMaxPrice === String(p)
                    ? "text-brand-300 bg-brand-600/15 border-brand-600/40"
                    : "text-gray-400 bg-surface-card border-white/10 hover:border-brand-600/40 hover:text-brand-400"
                }`}
              >
                ≤ {p / 1000}k
              </button>
            ))}
          </div>
        </FilterGroup>
      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full mt-5 py-2.5 rounded-lg border border-brand-600/40 bg-brand-600/10 text-brand-400 text-sm font-semibold hover:bg-brand-600/20 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({ title, active = false, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
          {title}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-brand-600/10 border border-brand-600/25 text-brand-400 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="p-1 hover:text-brand-200 rounded-full"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
