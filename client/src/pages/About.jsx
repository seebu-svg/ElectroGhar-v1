import BrandTagline from "../components/ui/BrandTagline";
import { BRAND_TAGLINE } from "../utils/brand.mjs";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, Clock, FileText, Laptop, MapPin, MessageCircle, Monitor, MonitorSmartphone, Phone, ShieldCheck, Smartphone, Wallet, Cable } from "lucide-react";
import { STATIC_PAGES } from "../utils/seoData.mjs";
import { CONTACT } from "../utils/contact";
import { SEOHead, organizationSchema } from "../utils/seo";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import heroImage from "../assets/hero-everyday.webp";
import storyImage from "../assets/hero-performance.webp";

const categories = [
  { icon: Laptop, title: "Laptops", slug: "laptops", text: "Explore available business laptops, everyday computing devices, and performance-oriented models from leading manufacturers." },
  { icon: MonitorSmartphone, title: "Desktop Computers", slug: "pcs-desktops", text: "Discover desktop computing options for offices, homes, and everyday productivity." },
  { icon: Monitor, title: "Monitors & Displays", slug: "monitors-displays", text: "Browse available displays for workstations, office setups, and general computing." },
  { icon: Smartphone, title: "Mobile Phones", slug: "mobile-phones", text: "Explore our mobile phone category for available devices and product updates." },
  { icon: Cable, title: "Computer Accessories", slug: "accessories", text: "Find accessories and complementary electronics to support your computing setup." },
];
const reasons = [
  { icon: FileText, title: "Clear Product Information", text: "We aim to provide useful specifications, condition details, and pricing so customers can make informed purchasing decisions." },
  { icon: Wallet, title: "Products for Different Budgets", text: "From affordable used laptops to higher-specification computing devices, customers can explore products according to their requirements." },
  { icon: Check, title: "Condition Transparency", text: "We identify product conditions, including used, refurbished, and faulty devices, where applicable, to help customers understand what they are purchasing." },
  { icon: ShieldCheck, title: "30-Day Checking Warranty", text: "Eligible working laptops include a limited 30-day checking warranty covering qualifying functional defects, subject to our published warranty terms.", link: "/warranty-policy" },
  { icon: MessageCircle, title: "Local Customer Support", text: "Customers can contact ElectroGhar through WhatsApp or visit our Karachi store for product inquiries and assistance." },
];
const steps = [
  ["Explore Products", "Browse available laptops and electronics by category, brand, or budget."],
  ["Review the Details", "Check product specifications, pricing, condition, availability, and warranty eligibility."],
  ["Ask Questions", "Contact our team if you need clarification about a product before purchasing."],
  ["Place Your Order", "Proceed with your purchase through the available ordering channels after reviewing the applicable store policies."],
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control";
const primary = `inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-action px-6 py-3 text-sm font-semibold text-content transition-colors hover:bg-action-hover ${focus}`;
const secondary = `inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-line bg-arctic/5 px-6 py-3 text-sm font-semibold text-content transition-colors hover:bg-arctic/10 ${focus}`;
const container = "mx-auto max-w-7xl px-4 sm:px-6";
function Intro({ eyebrow, title, id, children }) {
  return <div><p className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300"><span className="h-px w-7 bg-brand-400" aria-hidden="true" />{eyebrow}</p><h2 id={id} className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-content sm:text-4xl">{title}</h2>{children}</div>;
}
function External({ href, className, children }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}<span className="sr-only"> (opens in a new tab)</span></a>;
}
export default function About() {
  const canonicalBase = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.address)}`;
  return <div className="bg-surface">
    <SEOHead title={STATIC_PAGES["/about"].title} description={STATIC_PAGES["/about"].description} canonical={`${canonicalBase}/about`} type="website" jsonLd={[organizationSchema()]} />
    <section aria-labelledby="about-heading" className="relative isolate overflow-hidden bg-surface-dark">
      <img src={heroImage} alt="" fetchPriority="high" width="1536" height="1024" className="absolute inset-0 -z-10 h-full w-full object-cover object-[65%_center]" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight/95 via-midnight/75 to-midnight/20" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-surface-dark via-transparent to-midnight/20" />
      <div className={`${container} pb-8 pt-28 sm:pt-36`}>
        <div className="max-w-2xl py-12 sm:py-16">
          <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-content"><span className="h-px w-8 bg-brand-400" aria-hidden="true" />About ElectroGhar</p>
          <BrandTagline className="mb-5" />
          <h1 id="about-heading" className="text-4xl font-bold leading-[1.08] tracking-tight text-content sm:text-6xl lg:text-7xl">Your Local Destination for Laptops <span className="text-brand-300">& Electronics</span> in Karachi</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-content sm:text-lg">Discover laptops, computers, and everyday electronics at ElectroGhar. Whether you're a student, professional, business owner, or technology enthusiast, we're here to help you explore practical technology options that match your needs and budget.</p>
          <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row"><Link to="/products" className={primary}>Explore Products<ArrowRight size={18} aria-hidden="true" /></Link><Link to="/contact" className={secondary}>Contact Us<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6 text-sm text-muted">{[[MapPin, "Based in Karachi"], [FileText, "Clear condition details"], [MessageCircle, "Personal buying support"]].map(([Icon, label]) => <span key={label} className="flex items-center gap-2"><Icon size={17} className="text-brand-300" aria-hidden="true" />{label}</span>)}</div>
      </div>
    </section>

    <section aria-labelledby="who-heading" className={`${container} grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16`}>
      <div><Intro eyebrow="Who We Are" title="Technology for Everyday Life" id="who-heading" /><div className="mt-6 space-y-4 text-base leading-7 text-muted">
        <p>ElectroGhar is a Karachi-based electronics business offering laptops, computers, and technology products for customers with different requirements and budgets.</p>
        <p>Located at Naaz Digital Plaza on M.A. Jinnah Road, ElectroGhar connects customers with electronics from established brands, including HP, Dell, Lenovo, and others, subject to availability.</p>
        <p>We believe shopping for technology should be straightforward. Customers deserve clear product information, transparent condition details, and the opportunity to ask questions before making a purchase.</p>
        <p><strong className="font-semibold text-content">Precision</strong> means clear specifications and transparent condition details. <strong className="font-semibold text-content">Performance</strong> means helping you choose technology suited to your everyday needs. <strong className="font-semibold text-content">Perfection</strong> is the standard we strive for through thoughtful advice and attention to detail.</p>
        <p>Our goal is to make it easier for customers to discover suitable electronics, whether shopping online or visiting our physical store.</p>
      </div></div>
      <div className="overflow-hidden rounded-3xl border border-line bg-surface-card"><img src={storyImage} alt="Performance laptop in a charcoal studio" width="1536" height="1024" loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" /><div className="flex items-start gap-4 border-t border-line p-6 sm:p-8"><MapPin size={24} className="shrink-0 text-brand-300" aria-hidden="true" /><div><p className="text-lg font-semibold text-content">Online discovery. Local support.</p><p className="mt-2 text-sm leading-6 text-muted">Naaz Digital Plaza · M.A. Jinnah Road · Karachi</p></div></div></div>
    </section>

    <section aria-labelledby="offer-heading" className="border-y border-line bg-surface-alt py-16 sm:py-24"><div className={container}>
      <Intro eyebrow="What We Offer" title="Explore Technology That Fits Your Needs" id="offer-heading" />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">{categories.map(({ icon: Icon, title, slug, text }, i) => <Link key={slug} to={`/products?category=${slug}`} className={`group flex flex-col rounded-2xl border border-line bg-surface-card p-6 transition-colors hover:border-brand-400/40 hover:bg-surface ${focus} ${i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}`}><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-400/20 bg-brand-500/10 text-brand-300"><Icon size={23} aria-hidden="true" /></span><ArrowUpRight size={20} className="text-muted group-hover:text-brand-300" aria-hidden="true" /></div><h3 className="mt-6 text-xl font-semibold tracking-tight text-content">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-content group-hover:text-brand-300">Explore category<ArrowRight size={16} aria-hidden="true" /></span></Link>)}</div>
      <p className="mt-5 text-sm leading-6 text-muted">Product categories and availability may vary depending on current inventory.</p>
    </div></section>

    <section aria-labelledby="why-heading" className={`${container} py-16 sm:py-24`}><div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16"><Intro eyebrow="Why Choose ElectroGhar?" title="A Straightforward Way to Shop for Electronics" id="why-heading" /><div className="divide-y divide-line">{reasons.map(({ icon: Icon, title, text, link }, i) => <div key={title} className={`flex gap-4 py-6 sm:gap-5 ${i === 0 ? 'pt-0' : ''}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300"><Icon size={20} aria-hidden="true" /></span><div><h3 className="text-lg font-semibold text-content">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{text}</p>{link && <Link to={link} className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-semibold text-brand-300 hover:text-content ${focus}`}>Read warranty terms<ArrowRight size={16} aria-hidden="true" /></Link>}</div></div>)}</div></div></section>

    <section aria-labelledby="approach-heading" className="border-y border-line bg-surface-alt py-16 sm:py-24"><div className={container}><Intro eyebrow="Our Shopping Approach" title="Browse. Compare. Choose." id="approach-heading" /><ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([title, text], i) => <li key={title} className="border-t border-line pt-5"><span className="font-heading text-4xl font-bold tracking-tight text-brand-300">0{i + 1}</span><h3 className="mt-5 text-lg font-semibold text-content">{title}</h3><p className="mt-3 text-sm leading-7 text-muted">{text}</p></li>)}</ol><p className="mt-10 rounded-xl border border-line bg-surface p-5 text-sm leading-7 text-muted">We encourage customers to confirm product details and understand our <Link to="/warranty-policy" className={`rounded text-brand-300 underline underline-offset-4 ${focus}`}>warranty</Link>, <Link to="/refund-policy" className={`rounded text-brand-300 underline underline-offset-4 ${focus}`}>refund</Link>, and <Link to="/return-policy" className={`rounded text-brand-300 underline underline-offset-4 ${focus}`}>return policies</Link> before purchasing.</p></div></section>

    <section aria-labelledby="visit-heading" className={`${container} py-16 sm:py-24`}><div className="grid gap-10 lg:grid-cols-2 lg:gap-16"><div><Intro eyebrow="Visit ElectroGhar in Karachi" title="Shop Online or Visit Us" id="visit-heading" /><div className="mt-6 space-y-4 text-base leading-7 text-muted"><p>ElectroGhar operates from Naaz Digital Plaza, a well-known electronics shopping destination in Karachi.</p><p>Whether you prefer browsing online or discussing your requirements in person, our team is available to assist with product inquiries.</p></div><External href={directions} className={`${secondary} mt-7`}><MapPin size={18} aria-hidden="true" />Get Directions<ArrowUpRight size={16} aria-hidden="true" /></External></div><div className="rounded-3xl border border-line bg-surface-card p-6 sm:p-8"><dl className="space-y-6">{[[MapPin, "Store Address", <address key="address" className="not-italic">{CONTACT.address}, Pakistan.</address>], [Clock, "Business Hours", CONTACT.hours], [Phone, "Phone / WhatsApp", <a key="phone" href={CONTACT.callUrl} className={`rounded hover:text-brand-300 ${focus}`}>0331 9244435</a>]].map(([Icon, title, detail]) => <div key={title} className="flex gap-4"><Icon size={21} className="mt-1 shrink-0 text-brand-300" aria-hidden="true" /><div><dt className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</dt><dd className="mt-2 text-base leading-7 text-content">{detail}</dd></div></div>)}</dl><External href={CONTACT.whatsappUrl} className={`${primary} mt-8 w-full`}><MessageCircle size={18} aria-hidden="true" />Contact on WhatsApp<ArrowUpRight size={16} aria-hidden="true" /></External></div></div></section>

    <section aria-labelledby="upgrade-heading" className={`${container} pb-20 sm:pb-24`}><div className="relative isolate overflow-hidden rounded-3xl border border-brand-400/20 bg-surface-dark px-6 py-12 sm:px-12 sm:py-16"><div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-950/60 via-surface-dark to-surface-dark" /><Intro eyebrow="Find Your Next Upgrade" title="Better Technology Starts with the Right Choice." id="upgrade-heading" /><p className="mt-5 max-w-2xl text-base leading-7 text-muted">Explore ElectroGhar's available collection of laptops and electronics. Compare products, review their specifications, and choose the device that suits your needs.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/products" className={primary}>Shop All Products<ArrowRight size={18} aria-hidden="true" /></Link><Link to="/products?category=laptops" className={secondary}>Browse Laptops<Laptop size={18} aria-hidden="true" /></Link></div><p className="mt-8 border-t border-line pt-6 text-sm text-muted">ElectroGhar — {BRAND_TAGLINE}</p></div></section>
    <WhatsAppFAB />
  </div>;
}
