import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Battery,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  HardDrive,
  Layers,
  Loader2,
  MemoryStick,
  MessageCircle,
  Monitor,
  Phone,
  SearchX,
  ShieldCheck,
  Tag,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import Breadcrumb from "../components/ui/Breadcrumb";
import placeholderImg from "../assets/product-placeholder.png";
import { api } from "../utils/api";
import { formatPrice, conditionColor, buildWhatsAppLink, discountPercent } from "../utils/helpers";
import { SEOHead, productSchema, breadcrumbSchema } from "../utils/seo";

// Map spec keys to icons
const SPEC_ICONS = {
  processor: Cpu,
  ram: MemoryStick,
  storage: HardDrive,
  display: Monitor,
  graphics: Layers,
  os: Monitor,
};

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    api
      .getProduct(slug)
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!data?.product) {
    return (
      <div className="text-center py-24 px-4">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center mb-5">
          <SearchX className="w-6 h-6 text-brand-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-heading">Product not found</h2>
        <p className="text-sm text-gray-500 mb-6">
          It may have been sold or removed from the catalog.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white text-sm font-bold uppercase tracking-wide hover:bg-brand-500 transition-colors"
        >
          Browse All Products
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const { product, related } = data;
  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";
  const productUrl = `${canonicalBase}/product/${product.slug}`;
  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.thumbnail_url || placeholderImg];

  const discount = discountPercent(product.price, product.compare_at_price);
  const savings =
    product.compare_at_price && product.compare_at_price > product.price
      ? product.compare_at_price - product.price
      : 0;
  const inStock = product.is_available && product.stock_qty > 0;
  const lowStock = inStock && product.stock_qty <= 3;
  const whatsappLink = buildWhatsAppLink(
    product.whatsapp_number || "+92339244435",
    product.name,
    product.slug
  );
  const buyLink = whatsappLink.replace("I'm interested in", "I want to BUY");
  const hasStats = product.battery_health || product.warranty;

  return (
    <div className="relative bg-surface-alt min-h-screen">
      <SEOHead
        title={product.meta_title || product.name}
        description={
          product.meta_description ||
          product.description?.slice(0, 160) ||
          `Buy ${product.name} in ${product.condition_grade} condition at ElectroGhar. WhatsApp us for the latest price and delivery across Pakistan.`
        }
        canonical={productUrl}
        image={product.thumbnail_url || (Array.isArray(product.images) ? product.images[0] : undefined)}
        type="product"
        jsonLd={[
          productSchema(product),
          breadcrumbSchema([
            { label: "Products", to: `${canonicalBase}/products` },
            ...(product.category
              ? [{ label: product.category, to: `${canonicalBase}/products?category=${encodeURIComponent(product.category)}` }]
              : []),
            { label: product.name, to: productUrl },
          ]),
        ]}
      />
      {/* ── Ambient glow (clipped so it never breaks sticky) ─────── */}
      <div className="absolute inset-x-0 top-0 h-[32rem] overflow-hidden pointer-events-none">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[70rem] h-[32rem] glow-blob" />
      </div>

      {/* ── Breadcrumb (spaced away from the header) ─────────────── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        <Breadcrumb
          items={[
            { label: "Products", to: "/products" },
            { label: product.name },
          ]}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* ── Image Gallery (sticky on desktop) ─────────────── */}
          <div className="lg:sticky lg:top-24">
            <div className="relative bg-surface-card rounded-2xl border border-white/5 overflow-hidden aspect-[4/3] shadow-xl shadow-black/30">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-brand-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-brand-600/40">
                  -{discount}% OFF
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/10 shadow flex items-center justify-center text-white hover:bg-brand-600 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 border border-white/10 shadow flex items-center justify-center text-white hover:bg-brand-600 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <span className="absolute bottom-3 right-3 bg-black/70 border border-white/10 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {activeImage + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      i === activeImage
                        ? "border-brand-600 shadow-lg shadow-brand-600/30"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────────── */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
              {product.brand}
            </p>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 font-heading leading-tight">
              {product.name}
            </h1>

            {/* Condition & Availability */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${conditionColor(product.condition_grade)}`}>
                {product.condition_grade}
              </span>
              {product.condition_type && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 capitalize">
                  {product.condition_type}
                </span>
              )}
              {inStock ? (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border ${
                    lowStock
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lowStock ? `Only ${product.stock_qty} left` : `In Stock (${product.stock_qty})`}
                </span>
              ) : (
                <span className="text-xs font-medium text-brand-400 bg-brand-600/10 border border-brand-600/20 px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Price */}
            <div className="bg-surface-card border border-brand-600/25 rounded-2xl p-5 mb-6 shadow-lg shadow-brand-600/10">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-brand-600 text-white text-xs font-bold">
                    -{discount}% OFF
                  </span>
                )}
              </div>
              {savings > 0 && (
                <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                  <Tag className="w-3.5 h-3.5" />
                  You save {formatPrice(savings)}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2.5">
                Price is negotiable on WhatsApp — message us for the latest deal.
              </p>
            </div>

            {/* WhatsApp CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-500 transition-colors shadow-xl shadow-green-600/25"
              >
                <Phone className="w-5 h-5" />
                Ask Price on WhatsApp
              </a>
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-lg hover:bg-brand-500 transition-colors shadow-xl shadow-brand-600/30"
              >
                Buy Now
              </a>
            </div>
            <p className="text-xs text-gray-500 text-center mb-7">
              You&apos;ll be redirected to WhatsApp to confirm price and delivery details.
            </p>

            {/* Quick Stats */}
            {hasStats && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.battery_health && (
                  <InfoBox icon={Battery} label="Battery Health" value={product.battery_health} />
                )}
                {product.warranty && (
                  <InfoBox icon={ShieldCheck} label="Warranty" value={product.warranty} />
                )}
              </div>
            )}

            {/* Trust strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-5 border-t border-white/5">
              <TrustItem icon={ShieldCheck} text="Quality Checked" />
              <TrustItem icon={BadgeCheck} text="Honest Condition Grading" />
              <TrustItem icon={MessageCircle} text="Fast WhatsApp Support" />
            </div>
          </div>
        </div>

        {/* ── Specifications ─────────────────────────────────── */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="mt-14">
            <SectionTitle
              eyebrow="Technical Details"
              title="Specifications"
              sub="Everything under the hood, in plain numbers."
              className="mb-6"
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(product.specs).map(([key, value]) => {
                const Icon = SPEC_ICONS[key] || Layers;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 bg-surface-card border border-white/5 rounded-xl px-4 py-3.5 hover:border-brand-600/30 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/25 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm font-semibold text-gray-100 break-words mt-0.5">
                        {value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Description ────────────────────────────────────── */}
        {product.description && (
          <section className="mt-14">
            <SectionTitle eyebrow="Overview" title="About This Product" className="mb-6" />
            <div className="bg-surface-card rounded-2xl border border-white/5 p-6 sm:p-7">
              <div className="space-y-4">
                {String(product.description)
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((para, i) => (
                    <p
                      key={i}
                      className={`leading-relaxed ${i === 0 ? "text-gray-300" : "text-gray-400"}`}
                    >
                      {para}
                    </p>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Related Products ───────────────────────────────── */}
        {related && related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <SectionTitle
                eyebrow="Keep Browsing"
                title="You May Also Like"
                sub="More quality-checked picks from the same shelf."
              />
              <Link
                to="/products"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors shrink-0"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} showAskPrice />
              ))}
            </div>
          </section>
        )}
      </div>

      <WhatsAppFAB />
    </div>
  );
}

/* ── Section header with eyebrow for visual rhythm ────────────── */
function SectionTitle({ eyebrow, title, sub, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1.5">
        {eyebrow}
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">{title}</h2>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-surface-card rounded-xl border border-white/5 p-3">
      <div className="w-9 h-9 rounded-lg bg-brand-600/10 border border-brand-600/25 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-500" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-100">{value}</p>
      </div>
    </div>
  );
}

function TrustItem({ icon: Icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-400">
      <Icon className="w-4 h-4 text-brand-500" />
      {text}
    </span>
  );
}
