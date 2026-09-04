import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import heroBanner from "../assets/hero-banner.png";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { api } from "../utils/api";
import {
  ARRIVAL_BADGES,
  BRANDS,
  QUICK_LINKS,
  SEO_LINKS,
  STEPS,
  USE_CASES,
  WHY_ITEMS,
} from "./homeData";

const WA_GENERAL =
  "https://wa.me/923001234567?text=Hi%20ElectroGhar!%20I%20want%20to%20buy%20a%20laptop.";

const WHY_ICON_MAP = { ShieldCheck, BadgeCheck, Tag, MessageCircle, Truck };

// ────────────────────────────────────────────────────────────────
// 1. Hero — Find Your Next Laptop (full-bleed banner)
// ────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      <img
        src={heroBanner}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark gradient overlay on left for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      {/* Content — positioned on left side */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-20 sm:py-24 lg:py-32">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" />
            Pakistan&apos;s Trusted Used Laptop Store
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6 text-white">
            Good Laptops.{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-brand-500">
              Better Deals.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-lg">
            Quality checked used and refurbished laptops from trusted brands.
            Find the right laptop and get the latest price directly on WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-brand-500 text-white font-bold text-lg hover:bg-brand-600 transition-colors shadow-xl shadow-brand-600/40"
            >
              <Search className="w-5 h-5" />
              Browse Laptops
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition-colors shadow-xl shadow-green-700/40"
            >
              <Phone className="w-5 h-5" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 2. Quick Search / Laptop Finder
// ────────────────────────────────────────────────────────────────
function QuickSearch() {
  const [query, setQuery] = useState("");

  return (
    <section className="bg-white border-b border-gray-100 py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          What Are You Looking For?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Search by name, brand, model or processor — or pick a shortcut below.
        </p>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) {
              window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
            }
          }}
          className="relative max-w-xl mx-auto mb-6"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search laptop, brand, model or processor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
          >
            Search
          </button>
        </form>

        {/* Quick category pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((item) => {
            const qs = new URLSearchParams(item.params).toString();
            return (
              <Link
                key={item.label}
                to={`/products?${qs}`}
                className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-all"
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 3. Featured Laptops
// ────────────────────────────────────────────────────────────────
function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getFeaturedProducts()
      .then((r) => setProducts(r.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-surface-alt py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
              Handpicked
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Laptops
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Handpicked laptops worth checking out.
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            View All Laptops <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} showAskPrice />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600"
          >
            View All Laptops <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 4. Shop by Brand
// ────────────────────────────────────────────────────────────────
function ShopByBrand() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
            Trusted Names
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shop by Brand
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Explore laptops from the brands you already trust.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {BRANDS.map((b) => (
            <Link
              key={b.slug}
              to={`/products?brand=${encodeURIComponent(b.slug)}`}
              className="group relative rounded-2xl overflow-hidden border border-gray-100 hover:border-brand-300 hover:shadow-lg transition-all"
            >
              {/* Gradient header strip */}
              <div
                className={`h-20 bg-gradient-to-br ${b.gradient} flex items-center justify-center`}
              >
                <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow">
                  {b.name}
                </span>
              </div>
              <div className="p-4 bg-white">
                <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                  {b.tagline}
                </p>
                <p className="mt-2 text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                  Shop {b.name} →
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 5. Find the Right Laptop (Use Cases)
// ────────────────────────────────────────────────────────────────
function UseCases() {
  return (
    <section className="bg-surface-alt py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
            Purpose Built
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Built for What You Do.
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {USE_CASES.map((uc) => (
            <Link
              key={uc.slug}
              to={`/products?category=${uc.slug}`}
              className="group flex flex-col items-center gap-3 bg-white rounded-2xl p-6 border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all text-center"
            >
              <span className="text-4xl">{uc.icon}</span>
              <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-700">
                {uc.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">{uc.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 6. Why ElectroGhar?
// ────────────────────────────────────────────────────────────────
function WhySection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
            Our Promise
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Why Buy From ElectroGhar?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {WHY_ITEMS.map((item) => {
            const Icon = WHY_ICON_MAP[item.icon] || ShieldCheck;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-surface-alt border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 7. Latest Arrivals / Deals
// ────────────────────────────────────────────────────────────────
function LatestArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    api
      .getLatestProducts(8)
      .then((r) => setProducts(r.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="bg-gradient-to-b from-brand-50 to-white py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
              Just In
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Fresh Stock. Fresh Deals.
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              New laptops are added regularly. Check out the latest before they&apos;re gone.
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-72 shrink-0 bg-white rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
          >
            {products.map((p, i) => (
              <div key={p.id} className="w-72 shrink-0 snap-start relative">
                {/* Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                    {ARRIVAL_BADGES[i % ARRIVAL_BADGES.length]}
                  </span>
                </div>
                <ProductCard product={p} showAskPrice />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/products?sort=created_at.desc"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 text-white font-semibold hover:bg-brand-600 transition-colors"
          >
            Explore Latest Arrivals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 8. How It Works
// ────────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-1">
            Simple Process
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Buying a Laptop Is Simple.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-brand-200" />

          {STEPS.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center text-center gap-4">
              {/* Number circle */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-brand-500 flex flex-col items-center justify-center shadow-lg shadow-brand-500/30">
                <span className="text-3xl font-extrabold text-white">{step.num}</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Flow summary */}
        <div className="mt-10 flex items-center justify-center gap-3 text-sm font-semibold text-gray-700">
          <span className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700">Browse</span>
          <ArrowRight className="w-4 h-4 text-brand-400" />
          <span className="px-3 py-1.5 rounded-full bg-green-50 text-green-700">WhatsApp</span>
          <ArrowRight className="w-4 h-4 text-brand-400" />
          <span className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700">Buy</span>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// 9. Final CTA + SEO Content
// ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900 text-white">
      {/* CTA block */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Ready to Find Your Next Laptop?
        </h2>
        <p className="text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto">
          Explore quality used laptops from Dell, HP, Lenovo, Apple and other
          trusted brands. Find the right specifications, check availability and
          talk to ElectroGhar on WhatsApp.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-500 text-white font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/30"
          >
            <Search className="w-4 h-4" />
            Browse Laptops
          </Link>
          <a
            href={WA_GENERAL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30"
          >
            <Phone className="w-4 h-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* SEO block */}
      <div className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h3 className="text-base font-bold text-white mb-3">
            Used Laptops in Pakistan
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            ElectroGhar helps customers discover quality used and refurbished
            laptops in Pakistan. Explore laptops by brand, processor, RAM,
            storage, price range and purpose. Get the latest prices and buy
            directly through WhatsApp for a simple, trustworthy shopping
            experience.
          </p>
          <div className="flex flex-wrap gap-3">
            {SEO_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-brand-300 hover:text-brand-200 underline underline-offset-2 decoration-brand-500/40 hover:decoration-brand-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Home Page
// ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Hero />
      <QuickSearch />
      <Featured />
      <ShopByBrand />
      <UseCases />
      <WhySection />
      <LatestArrivals />
      <HowItWorks />
      <FinalCTA />
      <WhatsAppFAB />
    </>
  );
}
