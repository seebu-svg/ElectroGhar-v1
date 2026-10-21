import BrandTagline from "../ui/BrandTagline";
import { CONTACT } from "../../utils/contact";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, MessageCircle, ArrowRight, ArrowUpRight } from "lucide-react";
import SiteLogo from '../ui/SiteLogo';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control';
const linkClass = `inline-flex min-h-11 items-center rounded-md text-sm text-muted transition-colors hover:text-content ${focus}`;
function FooterLinks({ title, links }) {
  return <nav aria-label={`Footer ${title}`}><h2 className="mb-3 text-sm font-semibold text-content">{title}</h2><ul>{links.map(([to, label]) => <li key={to}><Link to={to} className={linkClass}>{label}</Link></li>)}</ul></nav>;
}
export default function Footer() {
  const [tree, setTree] = useState([]);
  useEffect(() => {
    let active = true;
    const load = () => api.getCategories().then(r => { if (active) setTree(r.tree || []); }).catch(() => {});
    load(); window.addEventListener('catalog-updated', load);
    return () => { active = false; window.removeEventListener('catalog-updated', load); };
  }, []);
  return <footer className="border-t border-line bg-surface-dark text-muted">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex flex-col justify-between gap-5 border-b border-line py-8 sm:flex-row sm:items-center sm:py-10"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300">Let’s find your next upgrade</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-content sm:text-2xl">Good tech starts with the right advice.</h2><p className="mt-2 text-sm leading-6 text-muted">Tell us what you need and we’ll help you explore your options.</p></div><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-12 shrink-0 items-center justify-center gap-3 self-start rounded-xl border border-line bg-arctic/5 px-5 text-sm font-semibold text-content transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 sm:self-auto ${focus}`}><MessageCircle size={18} />Talk to our team<ArrowUpRight size={16} /><span className="sr-only"> (opens in a new tab)</span></a></div>
      <div className="grid gap-x-8 gap-y-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.3fr] lg:gap-x-10 lg:py-14">
        <div><Link to="/" aria-label="ElectroGhar home" className={`inline-block rounded-lg ${focus}`}><SiteLogo alt="ElectroGhar" className="h-16 w-auto sm:h-20" loading="lazy" /></Link><BrandTagline footer className="mt-3 !text-xs" /><p className="mt-5 max-w-xs text-sm leading-7 text-muted">Laptops, desktops, monitors and everyday tech. Explore new, used and refurbished options with clear condition details and personal buying support.</p><Link to="/about" className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-md text-sm font-medium text-brand-300 hover:text-content ${focus}`}>Get to know ElectroGhar<ArrowRight size={15} /></Link></div>
        <FooterLinks title="Explore the store" links={[
          ['/products', 'All products'],
          ...tree.map(c => [`/products?category=${encodeURIComponent(c.slug)}`, c.name]),
          ['/products?featured=1', 'Best sellers'],
          ['/products?deals=1', 'Daily deals'],
        ]} />
        <FooterLinks title="Help & information" links={[
          ['/faqs', 'FAQs'], ['/warranty-policy', 'Warranty policy'], ['/refund-policy', 'Refund policy'], ['/return-policy', 'Return policy'], ['/contact', 'Contact us'], ['/blogs', 'Buying guides & blog'],
        ]} />
        <section aria-labelledby="footer-store-heading" className="self-start rounded-2xl border border-line bg-arctic/[0.025] p-5 sm:p-6"><h2 id="footer-store-heading" className="text-sm font-semibold text-content">Visit our Karachi store</h2><address className="mt-5 space-y-4 text-sm not-italic"><div className="flex items-start gap-3"><MapPin size={17} className="mt-1 shrink-0 text-brand-300" /><p className="leading-6 text-muted">{CONTACT.address}</p></div><div className="flex items-start gap-3"><Clock size={17} className="mt-1 shrink-0 text-muted" /><p className="leading-6 text-muted">{CONTACT.hours}</p></div><a href={CONTACT.callUrl} className={`flex min-h-11 items-center gap-3 rounded-lg text-content hover:text-brand-300 ${focus}`}><Phone size={17} className="shrink-0 text-muted" />{CONTACT.phone}</a><a href={`mailto:${CONTACT.email}`} className={`flex min-h-11 items-start gap-3 break-all rounded-lg py-2 text-muted hover:text-content ${focus}`}><Mail size={17} className="mt-0.5 shrink-0 text-muted" />{CONTACT.email}</a></address><Link to="/contact" className={`mt-4 flex min-h-11 items-center justify-between gap-2 rounded-xl border border-line px-3 text-sm font-medium text-content hover:bg-arctic/5 ${focus}`}>Store details & directions<ArrowUpRight size={16} /></Link></section>
      </div>
      <div className="flex flex-col gap-4 border-t border-line py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between"><p>&copy; {new Date().getFullYear()} ElectroGhar. All rights reserved.</p><nav aria-label="Legal information" className="flex flex-wrap gap-x-6"><Link to="/privacy" className={`inline-flex min-h-11 items-center rounded-md hover:text-content ${focus}`}>Privacy policy</Link><Link to="/terms" className={`inline-flex min-h-11 items-center rounded-md hover:text-content ${focus}`}>Terms of service</Link><a href="https://electroghar.pk" className={`inline-flex min-h-11 items-center rounded-md hover:text-content ${focus}`}>electroghar.pk</a></nav></div>
    </div>
  </footer>;
}
