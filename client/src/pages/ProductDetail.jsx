import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  ShieldCheck,
  Battery,
  Cpu,
  HardDrive,
  Monitor,
  MemoryStick,
  Layers,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { api } from "../utils/api";
import { formatPrice, conditionColor, buildWhatsAppLink, discountPercent } from "../utils/helpers";

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
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
        <Link to="/products" className="text-brand-600 font-semibold hover:underline">
          Browse all laptops
        </Link>
      </div>
    );
  }

  const { product, related } = data;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.thumbnail_url || "/placeholder-laptop.jpg"];

  const discount = discountPercent(product.price, product.compare_at_price);
  const whatsappLink = buildWhatsAppLink(
    product.whatsapp_number || "+923001234567",
    product.name,
    product.slug
  );

  return (
    <div className="bg-surface-alt min-h-screen">
      {/* ── Breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-brand-600">Laptops</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ── Image Gallery ────────────────────────────────── */}
          <div>
            <div className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden aspect-[4/3]">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  -{discount}% OFF
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-colors ${
                      i === activeImage ? "border-brand-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ─────────────────────────────────── */}
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
              {product.brand}
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Condition & Availability */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${conditionColor(product.condition_grade)}`}>
                {product.condition_grade}
              </span>
              {product.is_available ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock_qty})
                </span>
              ) : (
                <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  Sold Out
                </span>
              )}
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Price is negotiable on WhatsApp</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.battery_health && (
                <InfoBox icon={Battery} label="Battery Health" value={product.battery_health} />
              )}
              {product.warranty && (
                <InfoBox icon={ShieldCheck} label="Warranty" value={product.warranty} />
              )}
            </div>

            {/* WhatsApp CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
              >
                <Phone className="w-5 h-5" />
                Ask Price on WhatsApp
              </a>
              <a
                href={whatsappLink.replace(
                  "I'm interested in",
                  "I want to BUY"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 text-white font-bold text-lg hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20"
              >
                Buy Now
              </a>
            </div>

            <p className="text-xs text-gray-500 text-center">
              You&apos;ll be redirected to WhatsApp to confirm price and delivery details.
            </p>
          </div>
        </div>

        {/* ── Specifications ─────────────────────────────────── */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-50">
                {Object.entries(product.specs).map(([key, value]) => {
                  const Icon = SPEC_ICONS[key] || Layers;
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50"
                    >
                      <Icon className="w-4 h-4 text-brand-500 shrink-0" />
                      <span className="text-sm font-medium text-gray-500 w-28 capitalize shrink-0">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Description ────────────────────────────────────── */}
        {product.description && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed bg-white rounded-2xl border border-gray-100 p-5">
              {product.description}
            </p>
          </section>
        )}

        {/* ── Related Products ───────────────────────────────── */}
        {related && related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <WhatsAppFAB />
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
      <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
