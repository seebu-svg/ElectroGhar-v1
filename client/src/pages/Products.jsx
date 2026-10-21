import { collectionMetadata, canonicalUrl as buildCanonical, isFilteredSearch } from "../utils/seoData.mjs";
import { useEffect, useState, useCallback, useRef } from "react";
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
  { value: "stock_qty.desc", label: "Stock: High to Low" },
  { value: "created_at.desc", label: "Newest First" },
  { value: "price.asc", label: "Price: Low to High" },
  { value: "price.desc", label: "Price: High to Low" },
  { value: "discount.desc", label: "Biggest Discount" },
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
  "w-full min-h-11 px-3 py-2.5 rounded-xl border border-control bg-surface-card text-content text-sm focus:outline-none focus:ring-2 focus:ring-control focus:border-brand-600 transition-colors [&>option]:bg-surface-card [&>option]:text-content";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [tree, setTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandCounts, setBrandCounts] = useState({});
  const [specifications, setSpecifications] = useState({});
  const [mobileDraft, setMobileDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const requestVersion = useRef(0);

  const currentProcessor = searchParams.get('processor') || '';
  const currentRam = searchParams.get('ram') || '';
  const currentStorage = searchParams.get('storage') || '';

  // Read from URL
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentConditionType = searchParams.get("conditionType") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentFeatured = searchParams.get("featured") || "";
  const currentDeals = searchParams.get("deals") || "";
  const requestedSort = searchParams.get('sort');
  const legacySort = requestedSort && !requestedSort.includes('.') ? `${requestedSort}.${searchParams.get('order') || 'desc'}` : requestedSort;
  const currentSort = SORT_OPTIONS.some(option => option.value === legacySort) ? legacySort : 'stock_qty.desc';
  const requestedPage = Number(searchParams.get("page"));
  const currentPage = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  // Load filter options
  useEffect(() => {
    api.getCategories()
      .then((r) => {
        setCategories(r.categories || []);
        setTree(r.tree || []);
      })
      .catch(console.error);
    api.getBrands().then((r) => { setBrands(r.brands || []); setBrandCounts(r.brandCounts || {}); setSpecifications(r.specifications || {}); }).catch(console.error);
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
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
      if (currentMinPrice) params.minPrice = currentMinPrice;
      if (currentMaxPrice) params.maxPrice = currentMaxPrice;
      if (currentFeatured) params.featured = currentFeatured;
      if (currentDeals) params.deals = currentDeals;
      if (currentProcessor) params.processor = currentProcessor;
      if (currentRam) params.ram = currentRam;
      if (currentStorage) params.storage = currentStorage;

      const res = await api.getProducts(params);
      if (version !== requestVersion.current) return;
      setProducts(res.products || []);
      setPagination(res.pagination || {});
    } catch (err) {
      if (version !== requestVersion.current) return;
      setError("Unable to load products. Please try again.");
      setProducts([]);
      setPagination({});
      console.error(err);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [currentSearch, currentCategory, currentBrand, currentConditionType, currentCondition, currentMinPrice, currentMaxPrice, currentFeatured, currentDeals, currentSort, currentPage, currentProcessor, currentRam, currentStorage]);

  const invalidateRequest = useCallback(() => { requestVersion.current++; }, []);
  useEffect(() => {
    fetchProducts();
    return invalidateRequest;
  }, [fetchProducts, invalidateRequest]);

  // Update URL params
  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams(currentSort ? { sort: currentSort } : {});
  }

  const hasFilters =
    currentSearch || currentCategory || currentBrand || currentConditionType || currentCondition || currentMinPrice || currentMaxPrice || currentFeatured || currentDeals || currentProcessor || currentRam || currentStorage;

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
          : currentBrand ? `${currentBrand} Laptops & Electronics` : "All Products";

  const collection = collectionMetadata({ category: activeCat, brand: currentBrand, condition: currentConditionType, featured: currentFeatured, deals: currentDeals, page: currentPage });
  const metaDescription = currentSearch ? `Search ElectroGhar for ${currentSearch}. Compare product specifications and contact our Karachi store.` : collection.description;
  const canonicalUrl = buildCanonical(`/products?${searchParams}`);
  const noIndex = isFilteredSearch(searchParams) || (!loading && (!!error || !products.length));

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

  function browseHref(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    if (key === 'featured') next.delete('deals');
    if (key === 'deals') next.delete('featured');
    return `/products?${next}`;
  }
  const filterCount = [currentSearch, currentCategory, currentBrand, currentConditionType, currentCondition, currentMaxPrice || currentMinPrice, currentFeatured, currentDeals, currentProcessor, currentRam, currentStorage].filter(Boolean).length;

  const filterProps = {
    tree,
    brands,
    brandCounts,
    specifications,
    currentProcessor, currentRam, currentStorage,
    currentMinPrice,
    categories,
    currentCategory,
    currentBrand,
    currentConditionType,
    currentCondition,
    currentMaxPrice,
    updateParam,
    clearFilters,
    hasFilters,
    browseHref,
  };

  return (
    <div className="bg-surface min-h-screen [&_button]:cursor-pointer [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-control [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-control">
      <SEOHead
        title={currentSearch ? pageTitle : collection.title}
        description={metaDescription}
        canonical={canonicalUrl}
        noIndex={noIndex}
        type="website"
        jsonLd={[
          breadcrumbSchema(
            breadcrumbItems.map((i) => ({
              label: i.label,
              to: i.to || canonicalUrl,
            }))
          ),
          { "@type": "CollectionPage", "@id": canonicalUrl, url: canonicalUrl, name: collection.name, description: metaDescription },
          ...(products.length ? [itemListSchema(products, canonicalUrl)] : []),
        ]}
      />
      {/* ── Compact page header , the grid stays the hero ── */}
      <div className="relative bg-surface-dark border-b border-line overflow-hidden">



        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9 pb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            {/* Breadcrumb for subcategory */}
            {activeParent && (
              <nav className="inline-flex items-center gap-1.5 text-xs text-muted bg-arctic/[0.03] border border-line rounded-full px-3 py-1.5 mb-2.5">
                <Link
                  to={`/products?category=${activeParent.slug}`}
                  className="hover:text-brand-300 transition-colors"
                >
                  {activeParent.name}
                </Link>
                <ChevronRight className="w-3 h-3 text-muted" />
                <span className="text-muted font-medium">{activeCat.name}</span>
              </nav>
            )}
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-brand-600/15 border border-brand-600/30 flex items-center justify-center shrink-0">
                <EyebrowIcon className="w-4.5 h-4.5 text-brand-300" />
              </span>
              <div className="min-w-0">
                <h1 className="text-3xl sm:text-4xl font-bold text-content font-heading leading-tight">
                  {pageTitle}
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Find your next upgrade. Browse laptops and everyday tech, then take a closer look.</p>
              </div>
            </div>
          </div>

          {/* Marketplace trust markers */}
          <div className="hidden md:flex items-center gap-5 pb-1">
            {TRUST_ITEMS.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-muted">
                <t.icon className="w-4 h-4 text-brand-300" />
                {t.label}
              </span>
            ))}
          </div>
        </div>

        {(activeCat || currentBrand) && <p className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-4 text-sm text-muted leading-relaxed">{collection.intro}</p>}

        {/* ── Category navigation tabs ─────────────────────────── */}
        <div className="relative border-t border-line bg-midnight/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="category-navigation flex items-center gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
              <CategoryTab
                label="All Products"
                count={tree.reduce((sum, cat) => sum + (cat.total_count || 0), 0)}
                active={!currentCategory && !currentFeatured && !currentDeals}
                to="/products"
              />
              {tree.filter(cat => cat.total_count !== 0 || cat.slug === currentCategory || cat.children.some(sub => sub.slug === currentCategory)).map((cat) => {
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
                    to={browseHref("category", cat.slug)}
                  />
                );
              })}
              {/* Collections */}
              <span className="w-px h-6 bg-arctic/10 shrink-0 mx-1" aria-hidden="true" />
              <CategoryTab
                icon={Flame}
                label="Deals"
                active={!!currentDeals}
                to={browseHref("deals", "1")}
              />
              <CategoryTab
                icon={TrendingUp}
                label="Best Sellers"
                active={!!currentFeatured}
                to={browseHref("featured", "1")}
              />
            </div>
          </div>

          {/* Subcategory chips for the active department */}
          {activeTreeCat && (
            <div className="border-t border-line bg-midnight/10">
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="category-navigation flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 py-2">
                  <SubChip
                    label={`All ${activeTreeCat.name}`}
                    count={activeTreeCat.total_count}
                    active={currentCategory === activeTreeCat.slug}
                    to={browseHref("category", activeTreeCat.slug)}
                  />
                  {activeTreeCat.children.filter(sub => sub.product_count !== 0 || sub.slug === currentCategory).map((sub) => (
                    <SubChip
                      key={sub.slug}
                      label={sub.name}
                      count={sub.product_count}
                      active={currentCategory === sub.slug}
                      to={browseHref("category", sub.slug)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex gap-6 xl:gap-8">
          {/* ── Sidebar (desktop) ─────────────────────────────── */}
          <aside className="hidden lg:block w-56 xl:w-60 shrink-0">
            <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-line bg-surface-card p-5">
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* ── Main Content ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: results + sort + mobile filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 rounded-xl border border-line bg-surface-card p-3">
              <p role="status" aria-live="polite" className="text-xs sm:text-sm text-muted">
                {loading ? (
                  "Loading results…"
                ) : pagination.total ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-muted">
                      {Math.min((currentPage - 1) * PAGE_LIMIT + 1, pagination.total)}–
                      {Math.min(currentPage * PAGE_LIMIT, pagination.total)}
                    </span>{" "}
                    of <span className="font-semibold text-muted">{pagination.total}</span>{" "}
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
                  onClick={() => { setMobileDraft(new URLSearchParams(searchParams)); setShowMobileFilters(true); }}
                  aria-haspopup="dialog"
                  aria-expanded={showMobileFilters}
                  className={`lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    hasFilters
                      ? "border-brand-500/50 bg-brand-600/15 text-brand-300 shadow-lg shadow-brand-600/10"
                      : "border-line bg-surface-card text-muted hover:border-line"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {hasFilters && (
                    <span className="rounded-md bg-brand-500/15 px-1.5 text-xs">{filterCount}</span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                  <select
                    value={currentSort}
                    onChange={(e) => updateParam("sort", e.target.value)}
                    className="min-h-11 max-w-full appearance-none pl-9 pr-9 py-2 rounded-xl border border-control bg-surface-card text-content text-sm focus:outline-none focus:ring-2 focus:ring-control focus:border-brand-600 transition-colors cursor-pointer [&>option]:bg-surface-card [&>option]:text-content"
                    aria-label="Sort products"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            {hasFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {[['processor', currentProcessor], ['ram', currentRam], ['storage', currentStorage]].filter(([, value]) => value).map(([key, value]) => <FilterTag key={key} label={`${key === 'ram' ? 'RAM' : key}: ${value}`} onRemove={() => updateParam(key, '')} />)}
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
                {currentMinPrice && Number(currentMinPrice) > 1 && <FilterTag label={`From PKR ${Number(currentMinPrice).toLocaleString('en-PK')}`} onRemove={() => updateParam('minPrice', '')} />}
                {currentMaxPrice && (
                  <FilterTag
                    label={`Up to PKR ${Number(currentMaxPrice).toLocaleString("en-PK")}`}
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
                  className="ml-1 text-xs font-semibold text-muted hover:text-brand-300 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            <h2 className="sr-only">Browse {pageTitle}</h2>
            {/* Product Grid */}
            {loading ? (
              <div className="shop-product-grid grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
                {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
                  <div key={i} className="product-card bg-surface-card rounded-xl border border-line overflow-hidden">
                    <div className="aspect-[4/3] bg-surface-dark motion-safe:animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-full bg-arctic/5 rounded motion-safe:animate-pulse" />
                      <div className="h-5 w-3/4 bg-arctic/5 rounded motion-safe:animate-pulse" />
                      <div className="h-3 w-full bg-arctic/5 rounded motion-safe:animate-pulse" />
                      <div className="h-3 w-2/3 bg-arctic/5 rounded motion-safe:animate-pulse" />
                      <div className="mt-4 border-t border-line pt-4"><div className="h-7 w-28 bg-arctic/5 rounded motion-safe:animate-pulse" /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div role="alert" className="rounded-2xl border border-line bg-surface-card px-6 py-20 text-center text-muted">
                <p>{error}</p>
                <button onClick={fetchProducts} className="mt-5 min-h-11 rounded-xl border border-line px-5 text-sm font-semibold text-brand-300 hover:bg-arctic/5">Try again</button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface-card px-5 py-20 text-center">
                <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600/20 to-brand-600/5 border border-brand-600/20 flex items-center justify-center mb-6">
                  <SearchX className="w-8 h-8 text-brand-300" />
                </div>
                <h3 className="text-xl font-bold text-content mb-2 font-heading">
                  No products found
                </h3>
                <p className="text-sm text-muted mb-8 max-w-md mx-auto leading-relaxed">
                  Nothing matches your current filters. Try adjusting your search,
                  widening your budget, or clearing all filters to browse everything.
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-action text-content text-sm font-semibold hover:bg-action-hover transition-colors shadow-lg shadow-brand-600/25"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="shop-product-grid grid grid-cols-1 min-[440px]:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} variant="featured" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && products.length > 0 && pagination.totalPages > 1 && (
              <Pagination
                className="mt-8"
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                pageHref={(page) => { const params = new URLSearchParams(searchParams); params.set("page", String(page)); return `/products?${params}`; }}
                onPageChange={(page) => updateParam("page", String(page))}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ────────────────────────────── */}
      {showMobileFilters && mobileDraft && <MobileFilters onClose={() => setShowMobileFilters(false)} onApply={() => { const next = new URLSearchParams(mobileDraft); next.set('page', '1'); setSearchParams(next); setShowMobileFilters(false); }} onReset={() => setMobileDraft(new URLSearchParams({ sort: currentSort }))}>
        <FilterPanel {...filterProps}
          {...Object.fromEntries([['currentCategory', 'category'], ['currentBrand', 'brand'], ['currentConditionType', 'conditionType'], ['currentCondition', 'condition'], ['currentMinPrice', 'minPrice'], ['currentMaxPrice', 'maxPrice'], ['currentProcessor', 'processor'], ['currentRam', 'ram'], ['currentStorage', 'storage']].map(([prop, key]) => [prop, mobileDraft.get(key) || '']))}
          hasFilters={[...mobileDraft.keys()].some(key => !['page', 'sort'].includes(key))}
          updateParam={(key, value) => setMobileDraft(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; })}
          onCategorySelect={value => setMobileDraft(previous => { const next = new URLSearchParams(previous); next.set('category', value); return next; })}
          clearFilters={() => setMobileDraft(new URLSearchParams({ sort: currentSort }))} />
      </MobileFilters>}

      <WhatsAppFAB />
    </div>
  );
}

/* ── Category navigation tab ───────────────────────────────────── */
function CategoryTab({ icon: Icon, label, count, active, to }) {
  return (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 min-h-[44px] ${
        active
          ? "bg-brand-600/15 text-brand-300 border-brand-500/40"
          : "bg-surface-card/60 text-muted border-line hover:text-content hover:border-brand-600/40"
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
      {count !== undefined && (
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            active ? "bg-arctic/20 text-content" : "bg-arctic/5 text-muted"
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
      aria-current={active ? 'page' : undefined}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium border transition-all shrink-0 min-h-[44px] ${
        active
          ? "bg-brand-600/20 text-brand-300 border-brand-600/50"
          : "bg-transparent text-muted border-line hover:text-content hover:border-line"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className="text-[10px] text-muted">{count}</span>
      )}
    </Link>
  );
}

// ── Filter Sidebar (shared desktop + mobile drawer) ────────────
function FilterPanel({
  tree,
  brands,
  brandCounts, specifications, currentProcessor, currentRam, currentStorage, currentMinPrice,
  onCategorySelect,
  currentCategory,
  currentBrand,
  currentConditionType,
  currentCondition,
  currentMaxPrice,
  updateParam,
  clearFilters,
  hasFilters,
  onNavigate,
  browseHref,
}) {
  return (
    <div>
      {/* Panel heading */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-line">
        <span className="w-7 h-7 rounded-lg bg-brand-600/15 border border-brand-600/30 flex items-center justify-center">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-300" />
        </span>
        <h3 className="text-sm font-bold text-content font-heading">Refine Results</h3>
      </div>

      <div className="mt-3">
        {/* Category tree */}
        <FilterGroup title="Categories" active={!!currentCategory} defaultOpen>
          <div className="space-y-4">
            {tree.filter(cat => cat.total_count !== 0 || cat.slug === currentCategory || cat.children.some(sub => sub.slug === currentCategory)).map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || Cpu;
              const isActiveCat = currentCategory === cat.slug;
              return (
                <div key={cat.slug}>
                  <Link
                    to={browseHref("category", cat.slug)}
                    onClick={event => { if (onCategorySelect) { event.preventDefault(); onCategorySelect(cat.slug); } else onNavigate?.(); }}
                    className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                      isActiveCat ? "text-brand-300" : "text-content hover:text-brand-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                    <span className="text-[10px] text-muted font-normal">({cat.total_count || 0})</span>
                  </Link>
                  <ul className="mt-1.5 ml-6 space-y-0.5 border-l border-line pl-3">
                    {cat.children.filter(sub => sub.product_count !== 0 || sub.slug === currentCategory).map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          to={browseHref("category", sub.slug)}
                          onClick={event => { if (onCategorySelect) { event.preventDefault(); onCategorySelect(sub.slug); } else onNavigate?.(); }}
                          className={`flex items-center justify-between py-1 text-sm transition-colors ${
                            currentCategory === sub.slug
                              ? "text-brand-300 font-medium"
                              : "text-muted hover:text-content"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="text-[10px] text-muted shrink-0 ml-2">{sub.product_count || 0}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </FilterGroup>

        {/* Max price */}
        <FilterGroup title="Budget" active={!!(currentMinPrice || currentMaxPrice)} defaultOpen>
          <BudgetInput key={`min-${onCategorySelect ? 'draft' : currentMinPrice}`} immediate={!!onCategorySelect} label="Minimum price (PKR)" value={currentMinPrice} onApply={value => updateParam('minPrice', value)} />
          <BudgetInput key={`max-${onCategorySelect ? 'draft' : currentMaxPrice}`} immediate={!!onCategorySelect} label="Maximum price (PKR)" value={currentMaxPrice} onApply={value => updateParam('maxPrice', value)} />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[50000, 100000, 200000, 400000].map((p) => (
              <button
                key={p}
                onClick={() => updateParam("maxPrice", String(p))}
                className={`px-3 py-1.5 rounded-md text-[11px] border transition-colors ${
                  currentMaxPrice === String(p)
                    ? "text-brand-300 bg-brand-600/15 border-brand-600/40"
                    : "text-muted bg-surface-card border-line hover:border-brand-600/40 hover:text-brand-300"
                }`}
              >
                ≤ {p / 1000}k
              </button>
            ))}
          </div>
        </FilterGroup>        {/* Brand */}
        <FilterGroup title="Brand" active={!!currentBrand} defaultOpen>
          <select
            aria-label="Filter by brand"
            value={currentBrand}
            onChange={(e) => updateParam("brand", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}{brandCounts[b] !== undefined ? ` (${brandCounts[b]})` : ''}
              </option>
            ))}
          </select>
        </FilterGroup>

        {/* Condition type chips */}
        <FilterGroup title="Condition" active={!!currentConditionType} defaultOpen>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam("conditionType", "")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                !currentConditionType
                  ? "bg-action text-content border-brand-600"
                  : "bg-surface-card text-muted border-line hover:border-brand-600/40 hover:text-content"
              }`}
            >
              All
            </button>
            {CONDITION_TYPES.map((ct) => (
              <button
                key={ct.value}
                onClick={() => updateParam("conditionType", currentConditionType === ct.value ? "" : ct.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  currentConditionType === ct.value
                    ? "bg-action text-content border-brand-600"
                    : "bg-surface-card text-muted border-line hover:border-brand-600/40 hover:text-content"
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Condition grade */}
        <FilterGroup title="Quality Grade" active={!!currentCondition}>
          <select
            aria-label="Filter by quality grade"
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

        {['processor', 'ram', 'storage'].map((key) => {
          const current = { processor: currentProcessor, ram: currentRam, storage: currentStorage }[key];
          const options = specifications[key] || [];
          if (!options.length && !current) return null;
          const label = key === 'ram' ? 'RAM' : key.charAt(0).toUpperCase() + key.slice(1);
          return <FilterGroup key={key} title={label} active={!!current}>
            <select aria-label={`Filter by ${label}`} className={SELECT_CLS} value={current} onChange={e => updateParam(key, e.target.value)}>
              <option value="">Any {label}</option>
              {current && !options.some(option => option.value === current) && <option value={current}>{current}</option>}
              {options.map(option => <option key={option.value} value={option.value}>{option.value} ({option.count})</option>)}
            </select>
          </FilterGroup>;
        })}
        <p className="pt-3 text-[11px] leading-4 text-muted">Counts show the full catalog.</p>


      </div>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="w-full mt-5 py-2.5 rounded-lg border border-brand-600/40 bg-brand-600/10 text-brand-300 text-sm font-semibold hover:bg-brand-600/20 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({ title, active = false, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen || active);
  return (
    <div className="border-b border-line last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 py-3 text-sm font-semibold text-muted hover:text-content transition-colors"
      >
        <span className="flex items-center gap-2">
          {active && <span className="w-1.5 h-1.5 rounded-full bg-action" />}
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
    <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-brand-600/10 border border-brand-600/25 text-brand-300 text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="flex h-9 w-9 items-center justify-center hover:text-brand-300 rounded-full"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function BudgetInput({ value, onApply, label, immediate = false }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  function apply() {
    if (draft !== '' && (!Number.isFinite(Number(draft)) || Number(draft) < 0)) {
      setError('Enter a price of zero or more.'); return;
    }
    setError('');
    if (draft !== value) onApply(draft);
  }
  return <form className="mb-3" onSubmit={e => { e.preventDefault(); apply(); }}>
    <label className="block text-xs text-muted">{label}
      <div className="mt-2 flex gap-2"><input type="number" min="0" step="1" value={immediate ? value : draft} onChange={e => { setDraft(e.target.value); setError(''); if (immediate) onApply(e.target.value); }} placeholder="e.g. 50000" aria-invalid={!!error} className={`${SELECT_CLS} min-w-0`} />{!immediate && <button type="submit" className="min-h-11 shrink-0 rounded-xl border border-line px-3 text-xs font-semibold text-content hover:bg-arctic/5">Set</button>}</div>
    </label>
    {error && <p role="alert" className="mt-2 text-xs leading-5 text-error">{error}</p>}
  </form>;
}

function MobileFilters({ children, onClose, onApply, onReset }) {
  const panel = useRef(null);
  const close = useRef(onClose);
  useEffect(() => { close.current = onClose; }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('button')?.focus();
    const key = e => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); }
      if (e.key !== 'Tab') return;
      const elements = [...panel.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = elements[0]; const last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (media.matches) close.current(); };
    document.addEventListener('keydown', key);
    media.addEventListener('change', resize);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); media.removeEventListener('change', resize); previous?.focus(); };
  }, []);
  return <div className="fixed inset-0 z-[70] flex justify-end lg:hidden">
    <div aria-hidden="true" className="absolute inset-0 bg-midnight/65 backdrop-blur-sm" onClick={onClose} />
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="mobile-filters-heading" className="relative flex h-[100dvh] w-full max-w-md flex-col border-l border-line bg-surface-alt shadow-2xl">
      <div className="flex items-center justify-between border-b border-line p-5"><div><h2 id="mobile-filters-heading" className="text-lg font-semibold text-content">Refine your search</h2><p className="mt-1 text-xs text-muted">Choose your filters, then apply to see results.</p></div><button type="button" aria-label="Close filters" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-muted hover:bg-arctic/5"><X size={20} /></button></div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
      <div className="border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"><div className="flex gap-3"><button type="button" onClick={onReset} className="min-h-12 rounded-xl border border-line px-5 text-sm text-content">Reset</button><button type="button" onClick={onApply} className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-action px-5 text-sm font-semibold text-content hover:bg-action-hover">Apply Filters</button></div></div>
    </div>
  </div>;
}
