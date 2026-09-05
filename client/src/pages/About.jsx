import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { SEOHead, organizationSchema } from "../utils/seo";

const WA_GENERAL =
  "https://wa.me/923001234567?text=Hi%20ElectroGhar!%20I%20have%20a%20question.";

const STATS = [
  { value: "5", label: "Main Categories" },
  { value: "55+", label: "Subcategories" },
  { value: "60+", label: "Products in Stock" },
  { value: "100%", label: "Quality Checked" },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: "Quality Checked",
    desc: "Every device is inspected and tested before it earns a listing.",
  },
  {
    icon: BadgeCheck,
    title: "Honest Grading",
    desc: "New, used or refurbished — we describe condition exactly as it is.",
  },
  {
    icon: Tag,
    title: "Fair Prices",
    desc: "Market-checked prices with the latest rate confirmed on WhatsApp.",
  },
  {
    icon: MessageCircle,
    title: "Real Support",
    desc: "Talk to a real person before you buy — advice is always free.",
  },
  {
    icon: Truck,
    title: "Delivery Options",
    desc: "Ask about delivery available for your city across Pakistan.",
  },
  {
    icon: Zap,
    title: "Fast Response",
    desc: "We reply quickly on WhatsApp, six days a week.",
  },
];

export default function About() {
  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";

  return (
    <div className="bg-surface">
      <SEOHead
        title="About Us"
        description="ElectroGhar is Pakistan's trusted store for quality checked laptops, PCs, monitors, storage and gadgets. New, used and refurbished — honest grading, fair prices, WhatsApp support."
        canonical={`${canonicalBase}/about`}
        type="website"
        jsonLd={[organizationSchema()]}
      />
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute -left-32 -bottom-32 w-[30rem] h-[30rem] glow-blob pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/40 text-brand-400 text-xs font-semibold mb-6 tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            About ElectroGhar
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading leading-tight mb-5">
            Your Home for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-brand-500 to-brand-700 text-glow">
              Tech in Pakistan
            </span>
          </h1>
          <p className="text-gray-400 leading-relaxed max-w-2xl mx-auto">
            &quot;Ghar&quot; means home — and that is exactly what we want
            ElectroGhar to feel like. A place where you can shop for laptops,
            PCs, monitors and gadgets without pressure, without hidden flaws,
            and without paying a rupee more than you should.
          </p>
        </div>
      </section>

      {/* ── Story + Stats ────────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-2">
              Our Story
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading mb-5">
              From One Used Laptop to a Full Tech Catalog
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-gray-400 leading-relaxed">
              <p>
                ElectroGhar started with a single shelf of quality used laptops
                and one rule: never sell a device we would not use ourselves.
                Word spread, customers came back, and today we stock everything
                from business ultrabooks and gaming rigs to 4K monitors, SSDs
                and everyday gadgets.
              </p>
              <p>
                Every product — new, used or refurbished — is inspected,
                tested and honestly graded before it is listed. What you read
                on the product page is exactly what arrives at your door.
              </p>
              <p>
                We do not believe in pushy checkouts. Browse the catalog, pick
                what fits your budget, and message us on WhatsApp for the
                latest price and availability. Simple, transparent and
                pressure-free.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-600 text-white font-semibold text-sm hover:bg-brand-500 transition-colors shadow-lg shadow-brand-600/30"
              >
                Browse Products <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href={WA_GENERAL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold text-sm hover:bg-green-500 transition-colors shadow-lg shadow-green-600/25"
              >
                <Phone className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="relative bg-surface-card border border-white/5 rounded-2xl p-6 sm:p-8 overflow-hidden hover:border-brand-600/30 transition-colors"
              >
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative">
                  <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 font-heading">
                    {s.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────── */}
      <section className="bg-surface-alt py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-brand-500 uppercase tracking-widest mb-1">
              Our Promise
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="flex items-start gap-4 bg-surface-card border border-white/5 rounded-2xl p-6 hover:border-brand-600/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-600/10 border border-brand-600/25 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-100 mb-1">{v.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-surface-dark via-brand-950/60 to-surface-dark overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[40rem] h-72 glow-blob pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-4">
            Ready to Upgrade Your Tech?
          </h2>
          <p className="text-gray-400 mb-8">
            Explore the catalog or message us — we will help you find the right
            machine for your budget.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-brand-600 text-white font-bold hover:bg-brand-500 transition-colors glow-red"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={WA_GENERAL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-green-600 text-white font-bold hover:bg-green-500 transition-colors shadow-lg shadow-green-600/30"
            >
              <Phone className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <WhatsAppFAB />
    </div>
  );
}
