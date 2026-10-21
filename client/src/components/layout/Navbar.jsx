import { CONTACT } from "../../utils/contact";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight, MessageCircle, Search, LayoutGrid, Flame, ChevronRight } from "lucide-react";
import SiteLogo from '../ui/SiteLogo';
import SearchBar from "../ui/SearchBar";
import { api } from "../../utils/api";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: null },
  { label: "Best Sellers", to: "/products?featured=1" },
  { label: "Daily Deals", to: "/products?deals=1" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blogs" },
  { label: "Contact", to: "/contact" },
];
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopExpanded, setShopExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tree, setTree] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState('loading');
  const headerRef = useRef(null);
  const mobileToggle = useRef(null);
  const shopToggle = useRef(null);
  const moreToggle = useRef(null);
  const searchToggle = useRef(null);
  const lastY = useRef(0);
  const location = useLocation();
  useEffect(() => {
    let active = true;
    const load = () => {
      setCategoryStatus('loading');
      api.getCategories().then(r => { if (active) { setTree(r.tree || []); setCategoryStatus('ready'); } }).catch(() => { if (active) setCategoryStatus('error'); });
    };
    load(); window.addEventListener('catalog-updated', load);
    return () => { active = false; window.removeEventListener('catalog-updated', load); };
  }, []);
  useEffect(() => {
    const scroll = () => {
      const y = window.scrollY;
      if (y < 160) setHidden(false);
      else if (Math.abs(y - lastY.current) > 8) setHidden(y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    const key = e => {
      if (e.key !== 'Escape') return;
      if (searchOpen) { setSearchOpen(false); searchToggle.current?.focus(); }
      else if (moreOpen) { setMoreOpen(false); moreToggle.current?.focus(); }
      else if (open) { setOpen(false); mobileToggle.current?.focus(); }
      else if (shopOpen) { setShopOpen(false); shopToggle.current?.focus(); }
    };
    const outside = e => { if (!headerRef.current?.contains(e.target)) { setShopOpen(false); setOpen(false); setMoreOpen(false); setSearchOpen(false); } };
    window.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [open, shopOpen, moreOpen, searchOpen]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const close = () => { setOpen(false); setShopOpen(false); setMoreOpen(false); setSearchOpen(false); };
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);
  const params = new URLSearchParams(location.search);
  function isActive(to) {
    const [path, query] = to.split('?');
    if (location.pathname !== path) return false;
    if (!query) return !location.search;
    return [...new URLSearchParams(query)].every(([key, value]) => params.get(key) === value);
  }
  const closeMenus = () => { setOpen(false); setShopOpen(false); setShopExpanded(false); setMoreOpen(false); setSearchOpen(false); setHidden(false); };
  useEffect(() => {
    closeMenus();
  }, [location.pathname, location.search]);
  const shopActive = location.pathname === '/products' && !params.has('featured') && !params.has('deals');
  const categoryMessage = categoryStatus === 'loading' ? 'Loading categories…' : categoryStatus === 'error' ? 'Categories are unavailable. You can still browse all products.' : 'Explore our latest products in the catalog.';
  return <header ref={headerRef} onFocusCapture={() => { setFocused(true); setHidden(false); }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) { setFocused(false); setShopOpen(false); setMoreOpen(false); } }} onClick={e => { const a = e.target.closest('a'); if (a?.getAttribute('href')?.startsWith('/')) { closeMenus(); window.scrollTo(0, 0); } }} className={`sticky top-0 z-50 border-b border-line bg-surface-card/95 backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none [&_button]:cursor-pointer ${hidden && !open && !shopOpen && !moreOpen && !searchOpen && !focused ? '-translate-y-full' : 'translate-y-0'}`}>
    <div className="mx-auto flex h-[76px] max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6 lg:gap-5">
      <Link to="/" aria-label="ElectroGhar home" className={`shrink-0 rounded-lg ${focus}`}><SiteLogo alt="ElectroGhar" className="h-9 w-auto sm:h-10" /></Link>
      <nav aria-label="Main navigation" className="hidden shrink-0 lg:block"><ul className="flex items-center gap-0.5">{NAV_LINKS.slice(0, 4).map(link => <li key={link.label}>{link.to ? <Link to={link.to} aria-current={isActive(link.to) ? 'page' : undefined} className={`relative flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium transition-colors xl:px-3 xl:text-sm ${focus} ${isActive(link.to) ? 'bg-arctic/5 text-content after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full after:bg-action' : 'text-muted hover:bg-arctic/5 hover:text-content'}`}>{link.label === 'Daily Deals' && <Flame size={14} className="text-brand-300" aria-hidden="true" />}{link.label}</Link> : <button ref={shopToggle} type="button" onClick={() => { setShopOpen(!shopOpen); setMoreOpen(false); }} aria-expanded={shopOpen} aria-controls="desktop-shop-categories" className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold xl:text-sm ${focus} ${shopActive || shopOpen ? 'bg-brand-500/10 text-brand-300' : 'text-muted hover:bg-arctic/5'}`}><LayoutGrid size={15} />Shop<ChevronDown size={13} className={`transition-transform motion-reduce:transition-none ${shopOpen ? 'rotate-180' : ''}`} /></button>}</li>)}
        <li className="relative"><button ref={moreToggle} type="button" onClick={() => { setMoreOpen(!moreOpen); setShopOpen(false); }} aria-expanded={moreOpen} aria-controls="more-navigation" className={`flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium xl:text-sm ${focus} ${moreOpen || NAV_LINKS.slice(4).some(link => isActive(link.to)) ? 'bg-arctic/5 text-content' : 'text-muted hover:bg-arctic/5 hover:text-content'}`}>More<ChevronDown size={13} className={`transition-transform motion-reduce:transition-none ${moreOpen ? 'rotate-180' : ''}`} /></button>{moreOpen && <ul id="more-navigation" className="absolute left-0 top-full z-50 mt-3 w-48 rounded-2xl border border-line bg-surface-card p-2 shadow-2xl shadow-midnight/50">{NAV_LINKS.slice(4).map(link => <li key={link.to}><Link to={link.to} aria-current={isActive(link.to) ? 'page' : undefined} className={`flex min-h-11 items-center justify-between rounded-xl px-3 text-sm hover:bg-arctic/5 ${focus} ${isActive(link.to) ? 'text-brand-300' : 'text-muted'}`}>{link.label}<ChevronRight size={14} className="text-muted" /></Link></li>)}</ul>}</li>
      </ul></nav>
      <div className="ml-auto hidden min-w-0 flex-1 lg:block"><SearchBar compact placeholder="Search products…" /></div>
      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0"><button ref={searchToggle} type="button" onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }} aria-label={searchOpen ? 'Close search' : 'Search products'} aria-expanded={searchOpen} aria-controls="mobile-header-search" className={`flex h-11 w-11 items-center justify-center rounded-xl text-content hover:bg-arctic/5 lg:hidden ${focus}`}>{searchOpen ? <X size={21} /> : <Search size={21} />}</button><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-arctic/5 px-3 text-sm font-medium text-content transition-colors hover:border-brand-400/40 hover:bg-brand-500/10 xl:px-4 ${focus}`}><MessageCircle size={18} aria-hidden="true" /><span className="hidden xl:inline">WhatsApp</span><span className="sr-only xl:hidden">Chat on WhatsApp</span><span className="sr-only"> (opens in a new tab)</span></a><button ref={mobileToggle} type="button" onClick={() => { setOpen(!open); setShopOpen(false); setSearchOpen(false); }} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="mobile-navigation" className={`flex h-11 w-11 items-center justify-center rounded-xl border border-line text-content lg:hidden ${focus}`}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
    </div>
    {searchOpen && <div id="mobile-header-search" className="absolute inset-x-0 top-full border-y border-line bg-surface-card p-4 shadow-xl lg:hidden"><div className="mx-auto max-w-2xl"><SearchBar compact autoFocus placeholder="Search laptops, brands & models…" /><p className="mt-3 text-xs text-muted">Search by product, brand or model. Press Enter to see all results.</p></div></div>}
    {shopOpen && <div id="desktop-shop-categories" className="absolute inset-x-0 top-full hidden max-h-[70vh] overflow-y-auto border-b border-line bg-surface-card shadow-2xl shadow-midnight/50 lg:block"><div className="mx-auto max-w-7xl px-6 py-7"><div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-300">Find your next upgrade</p><h2 className="mt-2 text-lg font-semibold text-content">Shop by category</h2></div><Link to="/products" className={`inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-content hover:bg-arctic/5 ${focus}`}>Browse all products<ArrowRight size={16} /></Link></div>{categoryStatus === 'ready' && tree.length ? <div className="grid grid-cols-3 gap-4 xl:grid-cols-4">{tree.map(cat => <div key={cat.slug} className="min-w-0 rounded-xl border border-line bg-arctic/[0.02] p-4"><Link to={`/products?category=${encodeURIComponent(cat.slug)}`} className={`flex min-h-11 items-center justify-between gap-2 rounded-md text-sm font-semibold text-content hover:text-brand-300 ${focus}`}><span>{cat.name}</span><ChevronRight size={15} className="shrink-0 text-muted" /></Link><ul className="mt-2 border-t border-line pt-2">{(cat.children || []).map(sub => <li key={sub.slug}><Link to={`/products?category=${encodeURIComponent(sub.slug)}`} className={`block rounded-lg px-2 py-2.5 text-sm text-muted hover:bg-arctic/5 hover:text-content ${focus}`}>{sub.name}</Link></li>)}</ul></div>)}</div> : <p role="status" className="rounded-xl border border-line bg-arctic/[0.02] p-6 text-sm text-muted">{categoryMessage}</p>}</div></div>}
    {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute inset-x-0 top-full max-h-[calc(100dvh-76px)] overflow-y-auto overscroll-contain border-y border-line bg-surface-card shadow-2xl lg:hidden"><ul className="space-y-1 p-4">{NAV_LINKS.map(link => <li key={link.label}>{link.to ? <Link to={link.to} aria-current={isActive(link.to) ? 'page' : undefined} className={`flex min-h-12 items-center justify-between rounded-xl px-4 text-sm font-medium ${focus} ${isActive(link.to) ? 'bg-brand-500/10 text-brand-300' : 'text-muted hover:bg-arctic/5'}`}>{link.label}<ChevronRight size={15} className="text-muted" /></Link> : <><div className="flex items-center rounded-xl bg-arctic/5"><Link to="/products" className={`flex min-h-12 flex-1 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-content ${focus}`}><LayoutGrid size={16} />Shop all products</Link><button type="button" aria-label={shopExpanded ? 'Collapse categories' : 'Expand categories'} aria-expanded={shopExpanded} aria-controls="mobile-shop-categories" onClick={() => setShopExpanded(!shopExpanded)} className={`flex h-12 w-12 items-center justify-center rounded-xl text-muted ${focus}`}><ChevronDown size={17} className={shopExpanded ? 'rotate-180' : ''} /></button></div>{shopExpanded && <div id="mobile-shop-categories" className="ml-5 mt-2 border-l border-line pl-3">{categoryStatus === 'ready' && tree.length ? tree.map(cat => <details key={cat.slug} className="group"><summary className={`flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-sm font-medium text-content hover:bg-arctic/5 [&::-webkit-details-marker]:hidden ${focus}`}>{cat.name}<ChevronDown size={14} className="shrink-0 group-open:rotate-180" /></summary><ul className="ml-3 border-l border-line pl-2"><li><Link to={`/products?category=${encodeURIComponent(cat.slug)}`} className={`block rounded-lg px-3 py-3 text-sm text-brand-300 ${focus}`}>All {cat.name}</Link></li>{(cat.children || []).map(sub => <li key={sub.slug}><Link to={`/products?category=${encodeURIComponent(sub.slug)}`} className={`block rounded-lg px-3 py-3 text-sm text-muted hover:text-content ${focus}`}>{sub.name}</Link></li>)}</ul></details>) : <p role="status" className="p-3 text-sm text-muted">{categoryMessage}</p>}</div>}</>}</li>)}</ul><div className="border-t border-line p-5"><p className="text-xs leading-5 text-muted">Need help choosing? Our team can walk you through the options.</p><a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action text-sm font-semibold text-content hover:bg-action-hover ${focus}`}><MessageCircle size={18} />Ask on WhatsApp<span className="sr-only"> (opens in a new tab)</span></a></div></nav>}
  </header>;
}
