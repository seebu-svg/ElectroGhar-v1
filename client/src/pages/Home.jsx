import BrandTagline from "../components/ui/BrandTagline";
import { HOME_TITLE, DEFAULT_DESCRIPTION, faqEntries, faqSchema } from "../utils/seoData.mjs";
import { CONTACT } from "../utils/contact";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  MessageCircle,
  MapPin,
  Laptop,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import heroBanner from "../assets/hero-banner.webp";
import arrivalsBanner from "../assets/hero-performance.webp";
import { DEFAULT_SLIDES } from "../utils/heroSlides";
import ProductCard from "../components/product/ProductCard";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { api } from "../utils/api";
import { discountPercent, formatPrice } from "../utils/helpers";
import { SEOHead, organizationSchema, websiteSchema, itemListSchema } from "../utils/seo";
import { BUDGETS } from "./homeData";

const WA_GENERAL =
  `${CONTACT.whatsappUrl}?text=Hi%20ElectroGhar!%20I%27m%20looking%20for%20a%20product%2C%20can%20you%20help%3F`;

/* ────────────────────────────────────────────────────────────────
   Home , product-focused marketplace homepage.
   Shared catalog requests supply the shopping collections.
   ──────────────────────────────────────────────────────────────── */
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState([]);
  const [pool, setPool] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let active = true;
    // Independent collections remain usable if another request fails.
    Promise.allSettled([
      api.getCategories(),
      api.getProducts({ limit: 100, sort: "created_at", order: "desc" }),
      api.getProducts({ featured: 1, limit: 8, sort: "created_at", order: "desc" }),
      api.getProducts({ deals: 1, limit: 12 }),
      api.getBrands(),
    ]).then((results) => {
      if (!active) return;
      const [categories, inventory, selected, discounted, brandData] = results.map(result => result.status === "fulfilled" ? result.value : {});
      setTree(categories.tree || []);
      setPool(inventory.products || []);
      setFeatured(selected.products || []);
      setDeals((discounted.products || []).filter(p => Number(p.price) > 0 && Number(p.compare_at_price) > Number(p.price))
        .sort((a, b) => discountPercent(b.price, b.compare_at_price) - discountPercent(a.price, a.compare_at_price)));
      setBrands((brandData.brands || []).slice(0, 8));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  /* ── Derived collections (from the shared pool) ── */
  const newArrivals = pool.slice(0, 8);

  const recommended = (() => {
    const used = new Set([...featured, ...deals.slice(0, 4)].map((p) => p.id));
    const picks = [];
    tree.forEach((cat) => {
      const subSlugs = new Set([cat.slug, ...(cat.children || []).map((c) => c.slug)]);
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

  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";

  return (
    <>
      <SEOHead
        title={HOME_TITLE}
        description={DEFAULT_DESCRIPTION}
        canonical={`${canonicalBase}/`}
        type="website"
        jsonLd={[
          organizationSchema(),
          faqSchema(),
          websiteSchema(`${canonicalBase}/products`),
          ...(featured.length ? [itemListSchema(featured.slice(0, 8), `${canonicalBase}/products`)] : []),
        ]}
      />
      <Hero />
      <div className="home-content">
        {loading ? <HomeSkeleton /> : <Featured products={featured} />}
        <Budgets />
        {!loading && <>
          <NewArrivals products={newArrivals} />
          <DailyDeals products={deals} />
          <ShopByBrand brands={brands} />
          <Recommended products={recommended} />
        </>}
        <LocalShopping />
        <HomeFAQ />
        <FinalDiscovery />
      </div>
      <WhatsAppFAB />
    </>
  );
}

function HomeFAQ() {
  return (
    <section aria-labelledby="home-faq-heading" className="relative border-y border-line bg-surface-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">
              <span className="h-1.5 w-1.5 rounded-full bg-action" aria-hidden="true" />
              Buying with confidence
            </span>
            <h2 id="home-faq-heading" className="mt-4 max-w-sm text-2xl sm:text-3xl font-bold font-heading tracking-tight leading-tight text-content">Questions before you buy?</h2>
            <p className="mt-4 max-w-sm text-base leading-7 text-muted">Get clear answers about ordering, checking warranties and purchase policies.</p>

          </div>
          <div>
            <div className="space-y-3">
              {faqEntries.map(([question, answer], index) => (
                <details key={question} open={index === 0} className="group rounded-2xl border border-line bg-surface-card transition-colors open:border-brand-400/30 hover:border-line">
                  <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-5 rounded-2xl px-5 py-4 text-base font-semibold leading-6 text-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control sm:px-6 [&::-webkit-details-marker]:hidden">
                    <h3>{question}</h3>
                    <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-arctic/5 text-muted group-open:bg-brand-500/10 group-open:text-brand-300" aria-hidden="true">
                      <span className="absolute h-0.5 w-3 bg-current" />
                      <span className="absolute h-3 w-0.5 bg-current transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" />
                    </span>
                  </summary>
                  <div className="px-5 pb-6 sm:px-6"><p className="border-t border-line pt-4 text-base leading-7 text-muted">{answer}</p></div>
                </details>
              ))}
            </div>
            <Link to="/faqs" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-semibold text-muted transition-colors hover:text-brand-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control">View all FAQs & policies <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 1. Hero , Featured Product ───────────────────────────────── */
function HeroVideo({ slide, playing, reducedMotion }) {
  const ref = useRef(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (playing && !reducedMotion) video.play().catch(() => setFailed(true));
    else video.pause();
  }, [playing, reducedMotion]);
  if (reducedMotion || failed) return null;
  return <video ref={ref} muted loop playsInline preload="none" poster={slide.desktop_url} aria-hidden="true" onError={() => setFailed(true)} style={{ '--hero-desktop-position': slide.desktop_position || '65% center', '--hero-mobile-position': slide.mobile_position || '65% center' }} className="hero-slide-image absolute inset-0 h-full w-full object-cover">
    {slide.mobile_video_url && <source src={slide.mobile_video_url} media="(max-width: 639px)" />}
    {slide.video_url && <source src={slide.video_url} />}
  </video>;
}



function Hero() {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const configured = images.slice(0, 3);
  const slides = [...configured, ...DEFAULT_SLIDES.slice(configured.length)];
  useEffect(() => {
    let active = true;
    const load = () => api.getHeroImages().then(r => { if (active) { setImages(r.images || []); setIndex(0); } }).catch(() => {});
    load();
    window.addEventListener('hero-updated', load);
    return () => { active = false; window.removeEventListener('hero-updated', load); };
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (slides.length < 2 || paused || interacting || reducedMotion) return;
    const timer = setTimeout(() => setIndex(i => (i + 1) % slides.length), 7000);
    return () => clearTimeout(timer);
  }, [index, slides.length, paused, interacting, reducedMotion]);
  const change = (next) => { setIndex((next + slides.length) % slides.length); setPaused(true); };
  const current = slides[index] || slides[0];
  const fallback = DEFAULT_SLIDES[index % DEFAULT_SLIDES.length];
  const control = 'flex h-11 w-11 items-center justify-center rounded-full border border-line bg-midnight/30 text-content backdrop-blur-sm transition-colors hover:bg-arctic/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control';
  return (
    <section aria-roledescription="carousel" aria-label="Featured collections" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }} className="relative isolate w-full overflow-hidden bg-surface-dark">
      {slides.map((slide, i) => (
        <div key={slide.id} aria-hidden="true" className={`absolute inset-0 -z-10 transition-opacity duration-700 motion-reduce:transition-none ${index === i ? 'opacity-100' : 'opacity-0'}`}>
          <picture>
            {slide.mobile_url && <source media="(max-width: 639px)" srcSet={slide.mobile_url} />}
            <img src={slide.desktop_url} alt="" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'low'} decoding="async" onError={e => { e.currentTarget.onerror = null; e.currentTarget.parentElement.querySelector('source')?.remove(); e.currentTarget.srcset = ''; e.currentTarget.src = heroBanner; }} style={{ '--hero-desktop-position': slide.desktop_position || '65% center', '--hero-mobile-position': slide.mobile_position || '65% center' }} className="hero-slide-image h-full w-full object-cover" />
          </picture>
          {index === i && (slide.video_url || slide.mobile_video_url) && <HeroVideo slide={slide} playing={!paused && !interacting} reducedMotion={reducedMotion} />}
          <div className="absolute inset-0 bg-gradient-to-r from-midnight/85 via-midnight/35 to-transparent" />
          <div className="absolute inset-0 bg-midnight" style={{ opacity: Number(slide.overlay_opacity ?? 10) / 100 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/65 via-transparent to-midnight/15" />
        </div>
      ))}
      <div className="mx-auto flex min-h-[640px] max-w-7xl flex-col justify-between px-4 pb-7 pt-28 sm:min-h-[700px] sm:px-6 sm:pt-36 lg:min-h-[760px]">
        <div className="max-w-xl py-10 sm:py-14" aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-content/85"><span className="h-px w-8 bg-brand-400" />{current.eyebrow || fallback.eyebrow}</p>
          <BrandTagline className="mb-4" />
          <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-content sm:text-6xl lg:text-7xl">{current.title || fallback.title}</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-content sm:text-lg">{current.description || fallback.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to={current.button_url || fallback.button_url} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-action px-6 py-3 text-sm font-semibold text-content hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control">{current.button_label || fallback.button_label}<ArrowRight size={18} aria-hidden="true" /></Link>
            <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-midnight/20 px-5 py-3 text-sm font-semibold text-content backdrop-blur-sm hover:bg-arctic/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control"><MessageCircle size={18} aria-hidden="true" />Ask our team<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
          <p className="mt-7 flex items-center gap-2 text-xs text-muted"><ShieldCheck size={16} aria-hidden="true" />Clear condition details. Personal buying support.</p>
        </div>
        {slides.length > 1 && <div className="flex flex-wrap items-center justify-between gap-5 border-t border-line pt-5">
          <div className="flex gap-2">{slides.map((slide, i) => <button key={slide.id} onClick={() => change(i)} aria-label={`Show slide ${i + 1}: ${slide.title || DEFAULT_SLIDES[i].title}`} aria-pressed={index === i} className="group flex h-11 items-center gap-2 rounded-lg px-2 text-xs text-content focus-visible:outline-2 focus-visible:outline-control"><span className={`h-0.5 transition-all motion-reduce:transition-none ${index === i ? 'w-10 bg-brand-400' : 'w-5 bg-arctic/40 group-hover:bg-surface-card'}`} />{String(i + 1).padStart(2, '0')}</button>)}</div>
          <div className="flex items-center gap-2"><span className="mr-2 text-xs tabular-nums text-muted">{index + 1} / {slides.length}</span><button type="button" className={control} aria-label="Previous slide" onClick={() => change(index - 1)}><ChevronLeft size={19} /></button><button type="button" className={control} aria-label="Next slide" onClick={() => change(index + 1)}><ChevronRight size={19} /></button><button type="button" className={control} aria-label={paused || reducedMotion ? 'Play slideshow' : 'Pause slideshow'} onClick={() => { setPaused(!(paused || reducedMotion)); setReducedMotion(false); }}>{paused || reducedMotion ? <Play size={16} /> : <Pause size={16} />}</button></div>
        </div>}
      </div>
    </section>
  );
}

/* ── 2. Featured Products ─────────────────────────────────────── */
function Featured({ products }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="featured-products-heading" className="home-section border-b border-line bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300"><span className="h-px w-7 bg-brand-400" aria-hidden="true" />Handpicked</p>
            <h2 id="featured-products-heading" className="mt-2 text-2xl font-bold tracking-tight text-content sm:text-3xl">Featured Products</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">A closer look at selected laptops and everyday tech. Compare the specs, find your fit.</p>
          </div>
          <Link to="/products" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 self-start rounded-xl border border-line bg-arctic/[0.03] px-4 text-sm font-semibold text-content transition-colors hover:border-brand-400/40 hover:text-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control sm:self-auto">Browse all products<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <Carousel label="Featured Products">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Carousel>
      </div>
    </section>
  );
}

/* ── 3. Daily Deals ───────────────────────────────────────────── */
function DailyDeals({ products }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="deals-heading" className="home-section bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="deals-panel rounded-2xl border border-line bg-surface-card p-4 sm:p-6">
          <SectionHead id="deals-heading" icon={Flame} eyebrow="Current offers" title="Daily Deals" sub="Compare current prices and savings across the catalog." action={<HeadLink to="/products?deals=1">All deals</HeadLink>} />
          <Carousel label="Daily Deals">
            {products.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

/* ── 6. New Arrivals ──────────────────────────────────────────── */
function NewArrivals({ products }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby="new-arrivals-heading" className="home-section new-arrivals bg-surface-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="arrivals-banner relative isolate overflow-hidden rounded-2xl border border-line bg-surface-dark">
          <div className="arrivals-art" aria-hidden="true"><img src={arrivalsBanner} alt="" width="1536" height="1024" loading="lazy" decoding="async" className="h-full w-full object-cover" /></div>
          <div className="arrivals-banner-content relative px-6 py-7 sm:px-8 sm:py-6">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300"><Sparkles size={14} aria-hidden="true" />JUST LANDED</p>
            <h2 id="new-arrivals-heading" className="max-w-xl text-3xl font-bold leading-[1.12] tracking-tight text-content sm:text-4xl">Fresh Tech.<br className="lg:hidden" /><span className="hidden lg:inline"> </span>New Arrivals.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Discover recently added laptops and electronics at ElectroGhar.</p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-medium text-muted">
              {[{ icon: ShieldCheck, label: 'Quality Checked' }, { icon: Sparkles, label: 'Fresh Inventory' }, { icon: MapPin, label: 'Karachi Store' }].map(({ icon: Icon, label }) => <li key={label} className="flex items-center gap-1.5"><Icon size={13} className="text-brand-300" aria-hidden="true" />{label}</li>)}
            </ul>
            <Link to="/products?sort=created_at.desc" className="mt-5 inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-action px-4 py-2.5 text-sm font-semibold text-content transition-colors duration-200 hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control motion-reduce:transition-none">Explore New Arrivals<ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="mt-6">
          <Carousel label="New Arrivals" heading="Recently added">
            {products.map((p) => <ProductCard key={p.id} product={p} badge="Fresh Stock" />)}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Shop by Brand ─────────────────────────────────────────── */
function ShopByBrand({ brands }) {
  if (!brands.length) return null;
  return (
    <section aria-labelledby="brands-heading" className="home-section border-y border-line bg-surface-alt">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead id="brands-heading" eyebrow="Browse your way" title="Shop by Brand" sub="Have a brand in mind? Go straight to its catalog." action={<HeadLink to="/products">Full catalog</HeadLink>} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {brands.map(brand => <Link key={brand} to={`/products?brand=${encodeURIComponent(brand)}`} className="brand-tile group flex min-h-24 min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-surface-card px-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control sm:px-5">
            <h3 className="break-words text-base font-semibold tracking-tight text-content sm:text-lg">{brand}</h3><ArrowRight size={16} className="shrink-0 text-muted group-hover:text-brand-300" aria-hidden="true" />
          </Link>)}
        </div>
      </div>
    </section>
  );
}

/* ── 8. Recommended for You ───────────────────────────────────── */
function Recommended({ products }) {
  if (!products.length) return null;
  return (
    <section className="home-section bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHead
          icon={ThumbsUp}
          eyebrow="More to explore"
          title="Recommended Products"
          sub="Explore more options from across the catalog."
        />
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 9. Explore by Budget ─────────────────────────────────────── */
function Budgets() {
  const [budgets, setBudgets] = useState(() =>
    BUDGETS.map(({ max }) => ({ max, status: "loading", preview: [] }))
  );

  useEffect(() => {
    let active = true;
    // Each response includes an exact catalog-wide count, while fetching only
    // one preview. One failed request does not hide the other budgets.
    BUDGETS.forEach(({ max }) => {
      api.getProducts({ category: "laptops", maxPrice: max, minPrice: 1, limit: 1, sort: "price", order: "desc" })
        .then((res) => {
          if (!active) return;
          setBudgets((items) => items.map((item) => item.max === max
            ? { max, status: "ready", count: res.pagination.total, preview: res.products || [] }
            : item));
        })
        .catch(() => {
          if (!active) return;
          setBudgets((items) => items.map((item) => item.max === max
            ? { ...item, status: "error" }
            : item));
        });
    });
    return () => { active = false; };
  }, []);

  return (
    <section aria-labelledby="budget-heading" className="home-section bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300"><Wallet size={15} aria-hidden="true" />Find your fit</p>
            <h2 id="budget-heading" className="text-2xl font-bold tracking-tight text-content sm:text-3xl">Explore by Budget</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Your next laptop, at a price that works for you.</p>
          </div>
          <Link to="/products?category=laptops" className="hidden min-h-11 shrink-0 items-center gap-2 rounded-lg text-sm font-semibold text-muted hover:text-brand-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control sm:inline-flex">All laptops <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {budgets.map((b) => {
            const product = b.preview[0];
            const image = product?.thumbnail_url || (Array.isArray(product?.images) && product.images[0]);
            return (
              <Link key={b.max} to={`/products?category=laptops&minPrice=1&maxPrice=${b.max}&sort=price.desc`}
                aria-label={`Explore laptops up to ${formatPrice(b.max)}`}
                className="budget-card group relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface-card p-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control">
                <div className="relative">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Laptops up to</p>
                  <h3 className="mt-2 flex items-baseline gap-2 font-heading font-bold tracking-tight text-content"><span className="text-xs font-medium tracking-normal text-muted">PKR</span><span className="text-3xl">{b.max.toLocaleString("en-PK")}</span></h3>
                  <p aria-live="polite" className="mt-2 min-h-5 text-xs leading-5 text-muted">
                    {b.status === "loading" ? "Checking availability…" : b.status === "error" ? "Browse to check availability" : b.count === 0 ? "No matching laptops right now" : `${b.count.toLocaleString("en-PK")} ${b.count === 1 ? "laptop" : "laptops"} within budget`}
                  </p>
                </div>
                <div className="budget-media relative my-4 flex h-36 items-center justify-center rounded-xl bg-midnight/15 sm:h-40">
                  {b.status === "loading" ? <span className="h-20 w-3/4 rounded-xl bg-arctic/5 motion-safe:animate-pulse" aria-hidden="true" />
                    : image ? <img key={image} src={image} alt={product.name} width="320" height="200" loading="lazy" decoding="async" className="budget-image h-full w-full object-contain p-2" onError={e => { e.currentTarget.hidden = true; }} />
                    : <Laptop size={56} strokeWidth={1} className="text-muted" aria-hidden="true" />}
                </div>
                <span className="relative mt-auto flex min-h-11 items-center justify-between gap-2 border-t border-line pt-3 text-sm font-semibold text-content group-hover:text-brand-300">Explore Laptops<ArrowRight size={17} aria-hidden="true" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LocalShopping() {
  return (
    <section aria-labelledby="local-shopping-heading" className="home-section mx-auto max-w-7xl px-4 sm:px-6">
      <div className="rounded-2xl border border-line bg-surface-alt p-6 sm:p-8 lg:flex lg:items-center lg:gap-12">
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Online discovery. Local support.</p>
          <h2 id="local-shopping-heading" className="text-2xl font-bold tracking-tight text-content sm:text-3xl">Your Local Laptop Store in Karachi</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">Explore new, used and refurbished laptops at ElectroGhar. Compare HP, Dell, Lenovo and other brands in our <Link to="/products?category=laptops" className="local-shopping-link">laptop catalog</Link>, subject to availability. Visit <Link to="/contact" className="local-shopping-link">our store at Naaz Digital Plaza</Link> for help finding a laptop for study, work or everyday use.</p>
        </div>
        <ul className="mt-6 grid gap-4 border-t border-line pt-6 sm:grid-cols-3 lg:mt-0 lg:min-w-56 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {[{ icon: ShieldCheck, title: "Quality Checked", detail: "Inspected before listing" }, { icon: MapPin, title: "Karachi Store", detail: "Naaz Digital Plaza" }, { icon: MessageCircle, title: "WhatsApp Support", detail: "Ask our team for guidance" }].map(({ icon: Icon, title, detail }) => (
            <li key={title} className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/15 bg-brand-500/10 text-brand-300"><Icon size={17} aria-hidden="true" /></span><div><h3 className="text-sm font-semibold text-content">{title}</h3><p className="mt-0.5 text-xs text-muted">{detail}</p></div></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* A compact final action keeps support available without another shopping section. */
function FinalDiscovery() {
  return (
    <section aria-labelledby="shopping-support-heading" className="home-section bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 rounded-2xl border border-brand-400/20 bg-brand-500/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div><h2 id="shopping-support-heading" className="text-xl font-semibold tracking-tight text-content">Need help choosing?</h2><p className="mt-1 text-sm leading-6 text-muted">Tell our team your budget and what you need your next device to do.</p></div>
          <a href={WA_GENERAL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-content transition-colors duration-200 hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control motion-reduce:transition-none"><MessageCircle size={17} aria-hidden="true" />Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span><ArrowRight size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

/* ── Shared building blocks ───────────────────────────────────── */
function SectionHead({ id, icon: Icon, eyebrow, title, sub, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-1.5">
          {Icon && (
            <span className="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/30 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-brand-300" />
            </span>
          )}
          <p className="text-xs font-bold text-brand-300 uppercase tracking-widest">
            {eyebrow}
          </p>
        </div>
        <h2 id={id} className="text-2xl sm:text-3xl font-bold tracking-tight text-content font-heading">
          {title}
        </h2>
        {sub && <p className="text-sm text-muted mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function HeadLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg text-sm font-semibold text-brand-300 transition-colors hover:text-content focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control motion-reduce:transition-none"
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

function Carousel({ children, label = 'Products', heading }) {
  const ref = useRef(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const track = ref.current;
    const update = () => setEdges({ start: track.scrollLeft < 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
    update();
    track.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => { track.removeEventListener('scroll', update); observer.disconnect(); };
  }, [children]);
  const scroll = (direction) => {
    const track = ref.current;
    if (!track) return;
    const step = track.firstElementChild?.getBoundingClientRect().width + 20 || track.clientWidth;
    track.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  const control = 'flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-card text-content transition-colors hover:border-brand-400/50 hover:text-brand-300 disabled:opacity-30 disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-control';
  return <div role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="mb-3 flex items-center justify-between gap-3">
      <div>{heading ? <h3 className="text-lg font-semibold tracking-tight text-content">{heading}</h3> : <span className="text-xs text-muted">Browse products</span>}<span className="sr-only">Browse with the arrow buttons or left and right arrow keys</span></div>
      <div className="flex gap-2"><button type="button" aria-label={`Previous ${label.toLowerCase()}`} aria-controls={id} disabled={edges.start} onClick={() => scroll(-1)} className={control}><ChevronLeft size={18} aria-hidden="true" /></button><button type="button" aria-label={`Next ${label.toLowerCase()}`} aria-controls={id} disabled={edges.end} onClick={() => scroll(1)} className={control}><ChevronRight size={18} aria-hidden="true" /></button></div>
    </div>
    <div id={id} ref={ref} tabIndex={0} aria-label={`${label} carousel`} onKeyDown={e => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); scroll(e.key === 'ArrowLeft' ? -1 : 1); }
      if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); ref.current.scrollTo({ left: e.key === 'Home' ? 0 : ref.current.scrollWidth }); }
    }} className="product-carousel-track scrollbar-hide rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control">{children}</div>
  </div>;
}

function HomeSkeleton() {
  return (
    <section className="home-section bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-8 w-56 bg-surface-card rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-card rounded-2xl min-h-[440px] animate-pulse"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
