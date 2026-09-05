import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Eye,
  PenLine,
  Phone,
  Search,
  SearchX,
} from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import Pagination from "../components/ui/Pagination";
import { api } from "../utils/api";
import { formatDate } from "../utils/helpers";
import { SEOHead, breadcrumbSchema } from "../utils/seo";

const WA_GENERAL =
  "https://wa.me/923001234567?text=Hi%20ElectroGhar!%20I%20need%20buying%20advice.";

const PAGE_LIMIT = 9;

export default function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentPage = Number(searchParams.get("page") || 1);

  // Local input state so typing doesn't refetch on every keystroke;
  // the URL is the source of truth once the debounce fires.
  const [searchText, setSearchText] = useState(currentSearch);
  const debounceRef = useRef(null);
  const pushedSearchRef = useRef(currentSearch);

  // Keep the input in sync when the URL changes externally (back button, chips)
  useEffect(() => {
    if (currentSearch !== pushedSearchRef.current) {
      pushedSearchRef.current = currentSearch;
      setSearchText(currentSearch);
    }
  }, [currentSearch]);

  // Categories + featured post load once
  useEffect(() => {
    api.getBlogCategories().then((r) => setCategories(r.categories || [])).catch(console.error);
    api.getFeaturedBlog().then((r) => setFeatured(r.blog)).catch(console.error);
  }, []);

  // Posts refetch on filter/page change
  useEffect(() => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit: PAGE_LIMIT,
      sort: "published_at",
      order: "desc",
    };
    if (currentSearch) params.search = currentSearch;
    if (currentCategory) params.category = currentCategory;

    api
      .getBlogs(params)
      .then((r) => {
        setBlogs(r.blogs || []);
        setPagination(r.pagination || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentSearch, currentCategory, currentPage]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  }

  function onSearchChange(value) {
    setSearchText(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushedSearchRef.current = value;
      updateParam("search", value);
    }, 400);
  }

  const activeCat = categories.find((c) => c.slug === currentCategory);
  const showFeatured =
    featured && !currentSearch && !currentCategory && currentPage === 1;
  const gridPosts = showFeatured
    ? blogs.filter((b) => b.id !== featured.id)
    : blogs;

  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";
  const pageTitle = activeCat
    ? `${activeCat.name} Articles`
    : currentSearch
      ? `Search: ${currentSearch}`
      : "Guides, Tips & Honest Advice";
  const metaDescription = activeCat
    ? `Read ${activeCat.name.toLowerCase()} guides and advice from ElectroGhar. Pakistan-focused tips for buying, fixing and selling tech.`
    : currentSearch
      ? `Search results for "${currentSearch}" on the ElectroGhar blog. Buying guides, repair tips and honest tech advice for Pakistan.`
      : "Pakistan-focused tech buying guides, repair tips and honest advice from ElectroGhar. Laptops, PCs, monitors and gadgets.";
  const canonicalUrl = activeCat
    ? `${canonicalBase}/blogs?category=${encodeURIComponent(activeCat.slug)}`
    : currentSearch
      ? `${canonicalBase}/blogs?search=${encodeURIComponent(currentSearch)}`
      : `${canonicalBase}/blogs`;

  return (
    <div className="bg-surface-alt min-h-screen">
      <SEOHead
        title={pageTitle}
        description={metaDescription}
        canonical={canonicalUrl}
        type="website"
        jsonLd={[
          breadcrumbSchema([
            { label: "Blog", to: `${canonicalBase}/blogs` },
            ...(activeCat ? [{ label: activeCat.name, to: `${canonicalBase}/blogs?category=${activeCat.slug}` }] : []),
            ...(currentSearch ? [{ label: `Search: ${currentSearch}`, to: `${canonicalBase}/blogs?search=${encodeURIComponent(currentSearch)}` }] : []),
          ]),
        ]}
      />
      {/* ── Hero band ─────────────────────────────────────────────── */}
      <div className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-6 sm:pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/40 text-brand-400 text-xs font-semibold mb-5 tracking-wide">
              <BookOpen className="w-3.5 h-3.5" />
              ElectroGhar Blog
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading leading-tight mb-4">
              Guides, Tips &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700 text-glow">
                Honest Advice
              </span>
            </h1>
            <p className="text-gray-400 leading-relaxed">
              Everything we have learned about buying and fixing tech in
              Pakistan — straight from the shop floor.
            </p>
          </div>

          {/* Search — the primary tool on this page */}
          <div className="mt-7 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-brand-400 transition-colors pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search guides, fixes, comparisons…"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-card border border-white/10 text-gray-100 placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-all"
                aria-label="Search blog posts"
              />
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="relative border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 py-2.5">
              <CatChip label="All Posts" active={!currentCategory} onClick={() => updateParam("category", "")} />
              {categories.map((c) => (
                <CatChip
                  key={c.slug}
                  label={c.name}
                  count={c.post_count}
                  active={currentCategory === c.slug}
                  onClick={() => updateParam("category", currentCategory === c.slug ? "" : c.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Results line */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-500">
            {loading ? (
              "Loading posts…"
            ) : (
              <>
                <span className="font-semibold text-gray-300">{pagination.total || 0}</span>{" "}
                {pagination.total === 1 ? "article" : "articles"}
                {activeCat && <span> in {activeCat.name}</span>}
                {currentSearch && <span> matching “{currentSearch}”</span>}
              </>
            )}
          </p>
          {(currentSearch || currentCategory) && (
            <button
              onClick={() => {
                setSearchText("");
                setSearchParams({});
              }}
              className="text-xs font-semibold text-gray-500 hover:text-brand-400 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Featured post */}
        {showFeatured && !loading && (
          <Link
            to={`/blogs/${featured.slug}`}
            className="group grid lg:grid-cols-2 bg-surface-card border border-white/5 rounded-2xl overflow-hidden hover:border-brand-600/40 transition-all mb-10"
          >
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] bg-surface-dark overflow-hidden">
              <img
                src={featured.cover_image}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-transparent lg:bg-gradient-to-r" />
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-brand-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-brand-600/40">
                Featured
              </span>
            </div>
            <div className="p-6 sm:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <CategoryBadge category={featured.category} categories={categories} />
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" /> {featured.read_time} min read
                </span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white font-heading leading-snug mb-4 group-hover:text-brand-300 transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <AuthorAvatar name={featured.author} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-200 truncate">{featured.author}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(featured.published_at)} ·{" "}
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {featured.views || 0}
                    </span>
                  </p>
                </div>
                <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-brand-400 uppercase tracking-wider">
                  Read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Post grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogSkeleton key={i} />
            ))}
          </div>
        ) : gridPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center mb-5">
              <SearchX className="w-6 h-6 text-brand-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 font-heading">No articles found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Nothing matches your search. Try a different term or browse all posts.
            </p>
            <button
              onClick={() => {
                setSearchText("");
                setSearchParams({});
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-brand-500 transition-colors"
            >
              View All Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} categories={categories} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            className="mt-10"
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => updateParam("page", String(page))}
          />
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-surface-dark via-brand-950/60 to-surface-dark overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-4">
            Want Buying Advice?
          </h2>
          <p className="text-gray-400 mb-8">
            Skip the research rabbit hole. Tell us your budget and what you
            need — we will point you to the right machine.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-green-600 text-white font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/30"
            >
              <Phone className="w-4 h-4" /> Ask on WhatsApp
            </a>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors glow-red"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppFAB />
    </div>
  );
}

/* ── Blog card ─────────────────────────────────────────────────── */
function BlogCard({ post, categories }) {
  return (
    <Link
      to={`/blogs/${post.slug}`}
      className="group flex flex-col bg-surface-card rounded-2xl border border-white/5 shadow-lg shadow-black/30 hover:border-brand-600/50 hover:shadow-brand-600/15 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[16/9] bg-surface-dark overflow-hidden">
        <img
          src={post.cover_image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-card to-transparent pointer-events-none" />
        {post.is_featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-brand-600/40">
            Featured
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2.5 mb-3">
          <CategoryBadge category={post.category} categories={categories} />
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
            <Clock className="w-3 h-3" /> {post.read_time} min
          </span>
        </div>
        <h3 className="text-base font-bold text-white font-heading leading-snug mb-2 line-clamp-2 min-h-11 group-hover:text-brand-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="pt-3 border-t border-white/5 mt-auto flex items-center gap-2.5">
          <AuthorAvatar name={post.author} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-300 truncate">{post.author}</p>
            <p className="text-[11px] text-gray-600">{formatDate(post.published_at)}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all shrink-0" />
        </div>
      </div>
    </Link>
  );
}

/* ── Category chip (hero row) ──────────────────────────────────── */
function CatChip({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition-all shrink-0 min-h-[44px] ${
        active
          ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/25"
          : "bg-surface-card/60 text-gray-400 border-white/10 hover:text-white hover:border-brand-600/40"
      }`}
    >
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
    </button>
  );
}

/* ── Shared bits ───────────────────────────────────────────────── */
export function AuthorAvatar({ name, size = "md" }) {
  const initials = String(name || "EG")
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dims =
    size === "lg"
      ? "w-12 h-12 text-sm"
      : size === "sm"
        ? "w-7 h-7 text-[10px]"
        : "w-8 h-8 text-xs";
  return (
    <span
      className={`${dims} rounded-full bg-brand-600/15 border border-brand-600/30 text-brand-400 font-bold flex items-center justify-center shrink-0 select-none`}
    >
      {initials}
    </span>
  );
}

export function CategoryBadge({ category, categories }) {
  const cat = categories.find((c) => c.slug === category);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-600/10 border border-brand-600/30 text-brand-400 text-[10px] font-bold uppercase tracking-wider">
      <PenLine className="w-2.5 h-2.5" />
      {cat?.name || category || "General"}
    </span>
  );
}

function BlogSkeleton() {
  return (
    <div className="bg-surface-card rounded-2xl border border-white/5 overflow-hidden animate-pulse">
      <div className="aspect-[16/9] bg-surface-dark" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-5 w-full bg-white/5 rounded" />
        <div className="h-5 w-3/4 bg-white/5 rounded" />
        <div className="h-3 w-full bg-white/5 rounded" />
        <div className="h-3 w-2/3 bg-white/5 rounded" />
        <div className="pt-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-20 bg-white/5 rounded" />
            <div className="h-2.5 w-14 bg-white/5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
