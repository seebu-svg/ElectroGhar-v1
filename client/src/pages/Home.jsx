import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Flame,
  HardDrive,
  Laptop,
  LayoutGrid,
  MessageCircle,
  Monitor,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import heroBanner from "../assets/hero-banner.png";
import placeholderImg from "../assets/product-placeholder.png";
import ProductCard from "../components/product/ProductCard";
import SearchBar from "../components/ui/SearchBar";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { api } from "../utils/api";
import { discountPercent, formatPrice } from "../utils/helpers";
import { SEOHead, organizationSchema, websiteSchema, itemListSchema } from "../utils/seo";
import { BUDGETS, WHY_ITEMS } from "./homeData";

const WA_GENERAL =
  "https://wa.me/92339244435?text=Hi%20ElectroGhar!%20I%27m%20looking%20for%20a%20product%2C%20can%20you%20help%3F";

const CATEGORY_ICONS = {
  laptops: Laptop,
  "pcs-desktops": Cpu,
  "monitors-displays": Monitor,
  "storage-accessories": HardDrive,
  "gadgets-electronics": Zap,
};

const WHY_ICON_MAP = { ShieldCheck, BadgeCheck, MessageCircle };

/* ────────────────────────────────────────────────────────────────
   Home — product-focused marketplace homepage.
   One parallel fetch supplies every section; light sections are
   derived client-side from the shared pool.
   ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState([]);
  const [pool, setPool] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts({ limit: 100, sort: "created_at", order: "desc" }),
      api.getProducts({ featured: 1, limit: 8, sort: "created_at", order: "desc" }),
      api.getProducts({ deals: 1, limit: 12 }),
      api.getProducts({ featured: 1, limit: 8, sort: "stock_qty", order: "desc" }),
    ])
      .then(([catRes, poolRes, featRes, dealsRes, bestRes]) => {
        setTree(catRes.tree || []);
        setPool(poolRes.products || []);
        setFeatured(featRes.products || []);
        setDeals(
          [...(dealsRes.products || [])].sort(
            (a, b) =>
              discountPercent(b.price, b.compare_at_price) -
              discountPercent(a.price, a.compare_at_price)
          )
        );
        setBestSellers(bestRes.products || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived collections (from the shared pool) ── */
  const newArrivals = pool.slice(0, 8);

  const shelves = tree
    .map((cat) => {
      const subSlugs = new Set(cat.children.map((c) => c.slug));
      return {
        ...cat,
        products: pool.filter((p) => subSlugs.has(p.category)).slice(0, 4),
      };
    })
    .filter((s) => s.products.length > 0);

  const brands = (() => {
    const map = new Map();
    pool.forEach((p) => {
      if (!p.brand) return;
      if (!map.has(p.brand)) map.set(p.brand, []);
      map.get(p.brand).push(p);
    });
    return [...map.entries()]
      .map(([brand, products]) => ({
        brand,
        count: products.length,
        preview: products.slice(0, 3),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  })();

  const recommended = (() => {
    const used = new Set([...featured, ...deals.slice(0, 4)].map((p) => p.id));
    const picks = [];
    tree.forEach((cat) => {
      const subSlugs = new Set(cat.children.map((c) => c.slug));
      const pick = pool.find((p) => subSlugs.has(p.category) && !used.has(p.id));
      if (pick) {
        picks.push(pick);
        used.add(pick.id);
      }
    });
    pool.forEach((p) => {
      if (picks.length < 4 && !used.has(p.id)) {
        picks.push(p);
        used.add(p.id);
      }
    });
    return picks.slice(0, 4);
  })();

  const budgets = BUDGETS.map(({ max }) => {
    const items = pool.filter((p) => Number(p.price) > 0 && Number(p.price) <= max);
    return { max, count: items.length, preview: items.slice(0, 3) };
  });

  const whyProducts =
    featured.length >= 6 ? featured.slice(3, 6) : pool.slice(0, 3);

  const brandCount = new Set(
    pool.map((p) => p.brand).filter(Boolean)
  ).size;
  const categoryCount = tree.reduce(
    (n, c) => n + (c.children?.length || 0),
    0
  );

  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";

  return (
    <>
      <SEOHead
        title=""
        description="Pakistan's trusted marketplace for quality checked laptops, PCs, monitors, storage and gadgets — new, used and refurbished. Message us on WhatsApp for the latest price."
        canonical={`${canonicalBase}/`}
        type="website"
        jsonLd={[
          organizationSchema(),
          websiteSchema(`${canonicalBase}/products`),
          ...(featured.length ? [itemListSchema(featured.slice(0, 8), `${canonicalBase}/products`)] : []),
        ]}
      />
      <Hero
        products={featured.slice(0, 3)}
        stats={{
          products: pool.length,
          brands: brandCount,
          categories: categoryCount,
        }}
      />
      {loading ? (
        <HomeSkeleton />
      ) : (
        <>
          <Featured products={featured} />
          <DailyDeals products={deals} />
          <BestSellers products={bestSellers} />
          <CategoryShelves shelves={shelves} />
          <NewArrivals products={newArrivals} />
          <ShopByBrand brands={brands} />
          <Recommended products={recommended} />
          <Budgets budgets={budgets} />
          <WhySection products={whyProducts} />
        </>
      )}
      <FinalDiscovery />
      <WhatsAppFAB />
    </>
  );
}

/* ── 1. Hero — Featured Product ───────────────────────────────── */
function Hero({ products, stats }) {
  return (
    <section className="relative w-full min-h-[80vh] sm:min-h-[85vh] flex items-center overflow-hidden bg-surface-dark">
      <img
        src={heroBanner}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/75 to-surface-dark/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-surface-dark/40" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-surface-dark/90 to-transparent" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -left-40 bottom-0 w-[34rem] h-[34rem] glow-blob pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-36 pb-16 sm:pb-24">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/30 text-brand-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            Pakistan&rsquo;s Trusted Tech Store
          </p>
          <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white font-heading leading-[1.05]">
            Good Tech.
            <span className="text-brand-500"> Better Deals.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-400 leading-relaxed max-w-md">
            Laptops, PCs, monitors, storage and gadgets — quality checked,
            honestly graded, priced to move.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white text-sm font-bold tracking-wide uppercase hover:bg-brand-500 transition-colors"
            >
              <Search className="w-4 h-4" />
              Browse Products
            </Link>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-green-600 text-white text-sm font-bold tracking-wide uppercase hover:bg-green-500 transition-colors"
            >
              <Phone className="w-4 h-4" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {stats && stats.products > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <HeroStat value={`${stats.products}+`} label="Products in Stock" />
            <span className="hidden sm:block w-px h-10 bg-white/10" />
            <HeroStat value={stats.brands} label="Top Brands" />
            <span className="hidden sm:block w-px h-10 bg-white/10" />
            <HeroStat value={stats.categories} label="Categories" />
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-10 flex sm:grid sm:grid-cols-3 gap-4 max-w-3xl overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {products.map((p) => (
              <div key={p.id} className="min-w-[270px] sm:min-w-0 shrink-0">
                <HeroCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroCard({ product }) {
  const img =
    product.thumbnail_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    placeholderImg;
  const discount = discountPercent(product.price, product.compare_at_price);
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-brand-600/50 transition-colors"
    >
      <img
        src={img}
        alt={product.name}
        loading="lazy"
        className="w-16 h-16 rounded-lg object-cover bg-surface-dark shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider truncate">
          {product.brand}
        </p>
        <p className="text-sm font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-white">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-[11px] font-bold text-brand-400">
              -{discount}%
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function HeroStat({ value, label }) {
  return (
    <div>
      <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
        {value}
      </p>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mt-0.5">
        {label}
      </p>
    </div>
  );
}

/* ── 2. Featured Products ─────────────────────────────────────── */
function Featured({ products }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={Award}
          eyebrow="Handpicked"
          title="Featured Products"
          sub="The best laptops, PCs, monitors and gadgets on our shelf right now."
          action={<HeadLink to="/products">View All</HeadLink>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} showAskPrice />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 3. Daily Deals ───────────────────────────────────────────── */
function DailyDeals({ products }) {
  if (!products.length) return null;
  const items = products.slice(0, 10);
  return (
    <section className="relative bg-surface py-14 sm:py-16 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/30 flex items-center justify-center">
                <Flame className="w-4 h-4 text-brand-500" />
              </span>
              <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">
                Limited Time
              </p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              Daily Deals
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              The biggest discounts live right now — while stock lasts.
            </p>
          </div>
          <HeadLink to="/products?deals=1">All Deals</HeadLink>
        </div>
        <Carousel>
          {items.map((p) => (
            <div key={p.id} className="w-72 shrink-0 snap-start">
              <ProductCard product={p} showAskPrice />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ── 4. Best Sellers ──────────────────────────────────────────── */
function BestSellers({ products }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={TrendingUp}
          eyebrow="Most Popular"
          title="Best Sellers"
          sub="The products our customers ask about the most."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((p, i) => (
            <div key={p.id} className="relative">
              <span className="absolute -top-2.5 -left-2.5 z-10 w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-extrabold flex items-center justify-center shadow-lg shadow-brand-600/30 border-2 border-surface-alt">
                {i + 1}
              </span>
              <ProductCard product={p} showAskPrice />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/products?featured=1"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-600 text-white text-sm font-bold tracking-wide uppercase hover:bg-brand-500 transition-colors"
          >
            View All Best Sellers
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 5. Shop by Category ──────────────────────────────────────── */
function CategoryShelves({ shelves }) {
  if (!shelves.length) return null;
  return (
    <section className="bg-surface py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={LayoutGrid}
          eyebrow="Full Catalog"
          title="Shop by Category"
          sub="Five departments — every product quality checked."
          action={<HeadLink to="/products">View All</HeadLink>}
        />
        <div className="space-y-5">
          {shelves.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || Zap;
            const count =
              cat.total_count ?? cat.product_count ?? cat.children?.length ?? 0;
            return (
              <div
                key={cat.slug}
                className="bg-surface-card border border-white/5 rounded-2xl p-5 sm:p-6"
              >
                <div className="grid lg:grid-cols-[220px_1fr] gap-5 lg:gap-8">
                  <div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3 lg:justify-center">
                    <span className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-brand-500" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white font-heading truncate">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {count} products
                      </p>
                      <Link
                        to={`/products?category=${cat.slug}`}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        View all
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cat.products.map((p) => (
                      <MiniCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── 6. New Arrivals ──────────────────────────────────────────── */
function NewArrivals({ products }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={Sparkles}
          eyebrow="Fresh Stock"
          title="New Arrivals"
          sub="Recently added inventory — first come, first served."
          action={<HeadLink to="/products?sort=created_at&order=desc">View All</HeadLink>}
        />
        <Carousel>
          {products.map((p) => (
            <div key={p.id} className="w-72 shrink-0 snap-start">
              <span className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full bg-brand-600/10 border border-brand-600/25 text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                Fresh Stock
              </span>
              <ProductCard product={p} showAskPrice />
            </div>
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ── 7. Shop by Brand ─────────────────────────────────────────── */
function ShopByBrand({ brands }) {
  if (!brands.length) return null;
  return (
    <section className="bg-surface py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          eyebrow="Top Brands"
          title="Shop by Brand"
          sub="Dell, HP, Lenovo, Apple and more — jump straight to a brand."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <Link
              key={b.brand}
              to={`/products?brand=${encodeURIComponent(b.brand)}`}
              className="group bg-surface-card border border-white/5 rounded-2xl p-5 hover:border-brand-600/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white font-heading truncate group-hover:text-brand-400 transition-colors">
                    {b.brand}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.count} products
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </div>
              <div className="flex gap-2 mt-4">
                {b.preview.map((p) => {
                  const img =
                    p.thumbnail_url ||
                    (Array.isArray(p.images) && p.images[0]) ||
                    placeholderImg;
                  return (
                    <img
                      key={p.id}
                      src={img}
                      alt=""
                      loading="lazy"
                      className="w-16 h-16 rounded-lg object-cover bg-surface-dark border border-white/5"
                    />
                  );
                })}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Recommended for You ───────────────────────────────────── */
function Recommended({ products }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={ThumbsUp}
          eyebrow="Recommended for You"
          title="You Might Like"
          sub="A handpicked mix from across the catalog."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} showAskPrice />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Explore by Budget ─────────────────────────────────────── */
function Budgets({ budgets }) {
  const withItems = budgets.filter((b) => b.count > 0);
  if (!withItems.length) return null;
  return (
    <section className="bg-surface py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={Wallet}
          eyebrow="Budget Friendly"
          title="Explore by Budget"
          sub="Great tech at every price point."
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {withItems.map((b) => (
            <Link
              key={b.max}
              to={`/products?maxPrice=${b.max}`}
              className="group relative bg-surface-card border border-white/5 rounded-2xl p-5 overflow-hidden hover:border-brand-600/40 transition-all"
            >
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative">
                <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">
                  Under
                </p>
                <h3 className="text-xl font-extrabold text-white font-heading mt-1">
                  {formatPrice(b.max)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {b.count} products
                </p>
                <div className="flex -space-x-3 mt-4">
                  {b.preview.map((p) => {
                    const img =
                      p.thumbnail_url ||
                      (Array.isArray(p.images) && p.images[0]) ||
                      placeholderImg;
                    return (
                      <img
                        key={p.id}
                        src={img}
                        alt=""
                        loading="lazy"
                        className="w-11 h-11 rounded-full object-cover bg-surface-dark border-2 border-surface-card"
                      />
                    );
                  })}
                </div>
                <p className="mt-4 text-xs font-semibold text-brand-400 group-hover:text-brand-300 flex items-center gap-1 transition-colors">
                  Shop Now
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 10. Why ElectroGhar + product row ────────────────────────── */
function WhySection({ products }) {
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div>
          <p className="text-xs font-bold text-brand-500 uppercase tracking-widest mb-1.5">
            Our Promise
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-7">
            Why ElectroGhar?
          </h2>
          <div className="space-y-6">
            {WHY_ITEMS.map((item) => {
              const Icon = WHY_ICON_MAP[item.icon] || ShieldCheck;
              return (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-100">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {products.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {products.map((p) => (
              <MiniCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ── 11. Final Product Discovery — Still Looking? ─────────────── */
function FinalDiscovery() {
  return (
    <section className="relative bg-gradient-to-br from-surface-dark via-brand-950/60 to-surface-dark text-white overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[46rem] h-80 glow-blob pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/60 to-transparent" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading mb-3">
          Still Looking?
        </h2>
        <p className="text-gray-400 leading-relaxed mb-8 max-w-lg mx-auto">
          Search the catalog, browse everything, or just message us — tell us
          your budget and we&rsquo;ll find the right machine.
        </p>
        <div className="max-w-xl mx-auto mb-8">
          <SearchBar />
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white text-sm font-bold tracking-wide uppercase hover:bg-brand-500 transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse All Products
          </Link>
          <a
            href={WA_GENERAL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-green-600 text-white text-sm font-bold tracking-wide uppercase hover:bg-green-500 transition-colors"
          >
            <Phone className="w-4 h-4" />
            WhatsApp Us
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── Shared building blocks ───────────────────────────────────── */
function SectionHead({ icon: Icon, eyebrow, title, sub, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          {Icon && (
            <span className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/30 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-brand-500" />
            </span>
          )}
          <p className="text-xs font-bold text-brand-500 uppercase tracking-widest">
            {eyebrow}
          </p>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
          {title}
        </h2>
        {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function HeadLink({ to, children }) {
  return (
    <Link
      to={to}
      className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors shrink-0"
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

function Carousel({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (!ref.current) return;
    const amount = ref.current.offsetWidth * 0.75;
    ref.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };
  return (
    <div className="relative group">
      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
      >
        {children}
      </div>
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -ml-5 w-10 h-10 rounded-full bg-surface-dark/90 border border-white/10 items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:border-brand-600/60 hover:text-brand-400 transition-all z-10 shadow-xl"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 -mr-5 w-10 h-10 rounded-full bg-surface-dark/90 border border-white/10 items-center justify-center text-gray-300 opacity-0 group-hover:opacity-100 hover:border-brand-600/60 hover:text-brand-400 transition-all z-10 shadow-xl"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

function MiniCard({ product }) {
  const img =
    product.thumbnail_url ||
    (Array.isArray(product.images) && product.images[0]) ||
    placeholderImg;
  const discount = discountPercent(product.price, product.compare_at_price);
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-surface-dark rounded-xl border border-white/5 overflow-hidden hover:border-brand-600/40 transition-all"
    >
      <div className="relative aspect-[4/3] bg-surface-dark">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider truncate">
          {product.brand}
        </p>
        <p className="text-sm text-gray-200 font-medium truncate group-hover:text-brand-400 transition-colors">
          {product.name}
        </p>
        <p className="text-sm font-bold text-white mt-0.5">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

function HomeSkeleton() {
  return (
    <section className="bg-surface-alt py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-8 w-56 bg-surface-card rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl h-80 animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
