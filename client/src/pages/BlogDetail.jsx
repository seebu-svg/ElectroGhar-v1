import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Eye,
  FileText,
  Phone,
  SearchX,
  Tag,
} from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import Breadcrumb from "../components/ui/Breadcrumb";
import { api } from "../utils/api";
import { formatDate } from "../utils/helpers";
import { SEOHead, blogPostingSchema, breadcrumbSchema } from "../utils/seo";
import { AuthorAvatar, CategoryBadge } from "./Blogs";

const WA_GENERAL =
  "https://wa.me/923001234567?text=Hi%20ElectroGhar!%20I%20need%20buying%20advice.";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setBlog(null);
    setRelated([]);

    Promise.all([
      api.getBlog(slug),
      api.getBlogCategories().catch(() => ({ categories: [] })),
    ])
      .then(([res, catRes]) => {
        setBlog(res.blog);
        setRelated(res.related || []);
        setCategories(catRes.categories || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <BlogDetailSkeleton />;

  if (notFound || !blog) {
    return (
      <div className="bg-surface-alt min-h-screen flex items-center justify-center px-4">
        <div className="text-center py-20">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center mb-5">
            <SearchX className="w-6 h-6 text-brand-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-white font-heading mb-2">
            Article not found
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            It may have been unpublished or the link is wrong.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-brand-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";
  const blogUrl = `${canonicalBase}/blogs/${blog.slug}`;
  const categoryName = categories.find((c) => c.slug === blog.category)?.name || blog.category;

  return (
    <div className="bg-surface-alt min-h-screen">
      <SEOHead
        title={blog.meta_title || blog.title}
        description={blog.meta_description || blog.excerpt}
        canonical={blogUrl}
        image={blog.cover_image}
        type="article"
        jsonLd={[
          blogPostingSchema(blog, categories),
          breadcrumbSchema([
            { label: "Blog", to: `${canonicalBase}/blogs` },
            ...(blog.category
              ? [{ label: categoryName, to: `${canonicalBase}/blogs?category=${encodeURIComponent(blog.category)}` }]
              : []),
            { label: blog.title, to: blogUrl },
          ]),
        ]}
      />
      {/* ── Article header ─────────────────────────────────────── */}
      <header className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-10">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "Blog", to: "/blogs" },
                ...(blog.category ? [{ label: categoryName, to: `/blogs?category=${blog.category}` }] : []),
                { label: blog.title },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <CategoryBadge category={blog.category} categories={categories} />
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" /> {blog.read_time} min read
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Eye className="w-3.5 h-3.5" /> {blog.views || 0} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading leading-[1.15] mb-6">
            {blog.title}
          </h1>

          {/* Author row */}
          <div className="flex flex-wrap items-center gap-3">
            <AuthorAvatar name={blog.author} size="lg" />
            <div>
              <p className="text-sm font-bold text-gray-100">{blog.author}</p>
              <p className="text-xs text-gray-500">
                {blog.author_role || "ElectroGhar"} · {formatDate(blog.published_at || blog.created_at)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Cover image ────────────────────────────────────────── */}
      {blog.cover_image && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-0 sm:-mt-8 relative z-10">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full aspect-[21/9] object-cover"
            />
          </div>
        </div>
      )}

      {/* ── Body ───────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="text-[15px] sm:text-base text-gray-300 leading-[1.85] space-y-6">
          <BlogContent content={blog.content} />
        </div>

        {/* Tags */}
        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-gray-600" />
            {blog.tags.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full bg-surface-card border border-white/10 text-xs text-gray-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* ── Related posts ──────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-white font-heading flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-brand-500" />
              Keep Reading
            </h2>
            <Link
              to="/blogs"
              className="text-xs font-bold text-brand-400 uppercase tracking-wider hover:text-brand-300 transition-colors inline-flex items-center gap-1"
            >
              All posts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((post) => (
              <RelatedCard key={post.id} post={post} categories={categories} />
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-surface-dark via-brand-950/60 to-surface-dark overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-3">
            Need This Fixed or Found For You?
          </h2>
          <p className="text-gray-400 mb-7">
            Our workshop checks every machine we sell. Tell us what you need —
            we will match you with the right one.
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

/* ── Lightweight content renderer ─────────────────────────────────
   Seed content uses blank-line paragraphs, "## " h2, "### " h3 and
   "- " list items. Consecutive list lines group into one <ul>.     */
function BlogContent({ content }) {
  const blocks = String(content || "")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const out = [];
  let list = null;

  const flushList = () => {
    if (list && list.length) {
      out.push(
        <ul key={`ul-${out.length}`} className="space-y-2.5 pl-1">
          {list.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    list = null;
  };

  blocks.forEach((block, idx) => {
    const lines = block.split("\n").map((l) => l.trim());

    // Whole block is list items
    if (lines.every((l) => l.startsWith("- "))) {
      if (!list) list = [];
      lines.forEach((l) => list.push(l.slice(2)));
      return;
    }

    flushList();

    if (block.startsWith("### ")) {
      out.push(
        <h3 key={idx} className="text-lg font-bold text-white font-heading pt-4">
          {block.slice(4)}
        </h3>
      );
    } else if (block.startsWith("## ")) {
      out.push(
        <h2
          key={idx}
          className="text-xl sm:text-2xl font-extrabold text-white font-heading pt-6 pb-1 flex items-start gap-3"
        >
          <span className="mt-2 w-6 h-0.5 rounded-full bg-brand-600 shrink-0" />
          {block.slice(3)}
        </h2>
      );
    } else {
      out.push(<p key={idx}>{block}</p>);
    }
  });
  flushList();

  return out;
}

/* ── Related post card (compact) ───────────────────────────────── */
function RelatedCard({ post, categories }) {
  return (
    <Link
      to={`/blogs/${post.slug}`}
      className="group flex flex-col bg-surface-card rounded-2xl border border-white/5 shadow-lg shadow-black/30 hover:border-brand-600/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[16/9] bg-surface-dark overflow-hidden">
        <img
          src={post.cover_image}
          alt={post.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface-card to-transparent pointer-events-none" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <CategoryBadge category={post.category} categories={categories} />
        <h3 className="text-sm font-bold text-white font-heading leading-snug mt-2.5 mb-2 line-clamp-2 group-hover:text-brand-300 transition-colors">
          {post.title}
        </h3>
        <p className="text-[11px] text-gray-600 mt-auto pt-2 border-t border-white/5">
          {formatDate(post.published_at)} · {post.views || 0} views
        </p>
      </div>
    </Link>
  );
}

/* ── Skeleton ──────────────────────────────────────────────────── */
function BlogDetailSkeleton() {
  return (
    <div className="bg-surface-alt min-h-screen animate-pulse">
      <div className="bg-surface-dark border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 space-y-5">
          <div className="h-3 w-40 bg-white/5 rounded" />
          <div className="h-10 w-3/4 bg-white/5 rounded" />
          <div className="h-10 w-1/2 bg-white/5 rounded" />
          <div className="flex items-center gap-3 pt-2">
            <div className="w-12 h-12 rounded-full bg-white/5" />
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/5 rounded" />
              <div className="h-2.5 w-24 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-white/5 rounded"
            style={{ width: `${60 + ((i * 37) % 40)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
