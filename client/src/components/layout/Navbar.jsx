import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import logo from "../../assets/logo.png";
import SearchBar from "../ui/SearchBar";
import { api } from "../../utils/api";

/* ── Main navigation (in display order) ────────────────────────── */
const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Shop", to: null }, // mega-menu trigger
  { label: "Best Sellers", to: "/products?featured=1" },
  { label: "Daily Deals", to: "/products?deals=1" },
  { label: "Blog", to: "/blogs" },
];

function navLinkCls(active) {
  return `whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    active ? "text-brand-400" : "text-gray-400 hover:text-white"
  }`;
}

export default function Navbar() {
  const [open, setOpen] = useState(false); // mobile menu
  const [shopOpen, setShopOpen] = useState(false); // desktop Shop mega-menu
  const [shopExpanded, setShopExpanded] = useState(false); // mobile Shop accordion
  const [hidden, setHidden] = useState(false); // hide header while scrolling down
  const [tree, setTree] = useState([]);
  const headerRef = useRef(null);
  const lastYRef = useRef(0);
  const location = useLocation();

  // Category tree feeds the Shop mega-menu
  useEffect(() => {
    api
      .getCategories()
      .then((r) => setTree(r.tree || []))
      .catch(console.error);
  }, []);

  // Hide the header when scrolling down, show it again when scrolling up
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 96) {
        setHidden(false);
      } else {
        const delta = y - lastYRef.current;
        if (delta > 8) setHidden(true);
        else if (delta < -8) setHidden(false);
      }
      lastYRef.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus + reveal the header whenever the route changes
  useEffect(() => {
    setShopOpen(false);
    setOpen(false);
    setHidden(false);
    lastYRef.current = 0;
  }, [location.pathname, location.search]);

  // Escape + outside click close the mega-menu
  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (e) => e.key === "Escape" && setShopOpen(false);
    const onClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setShopOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [shopOpen]);

  // Manual active state (NavLink can't match query strings)
  function isActive(to) {
    const [path, query] = to.split("?");
    if (location.pathname !== path) return false;
    if (!query) return !location.search;
    return location.search.startsWith(`?${query}`);
  }

  const shopActive =
    location.pathname === "/products" &&
    new URLSearchParams(location.search).has("category");

  // Never hide the header while a menu is open
  const headerHidden = hidden && !shopOpen && !open;

  // Internal header links always land at the top of the page (covers
  // same-route clicks like the logo or category switches); external
  // links (WhatsApp) must not move the page
  const onHeaderClick = (e) => {
    const a = e.target.closest("a");
    if (a && !a.getAttribute("href")?.startsWith("http")) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <header
      ref={headerRef}
      onClick={onHeaderClick}
      className={`sticky top-0 z-50 bg-surface-dark/90 backdrop-blur-md border-b border-white/5 transition-transform duration-300 will-change-transform ${
        headerHidden ? "-translate-y-full" : "translate-y-0"
      }`}
      onMouseLeave={() => setShopOpen(false)}
    >
      <nav className="max-w-7xl mx-auto flex items-center gap-2 px-4 sm:px-6 h-16">
        {/* ── Logo ──────────────────────────────────────────── */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src={logo}
            alt="ElectroGhar"
            className="h-9 sm:h-10 w-auto"
          />
        </Link>

        {/* ── Main navigation (desktop) ─────────────────────── */}
        <ul className="hidden lg:flex items-center gap-0.5 ml-2">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <li key={link.label}>
                <Link to={link.to} className={navLinkCls(isActive(link.to))}>
                  {link.label}
                </Link>
              </li>
            ) : (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => setShopOpen((v) => !v)}
                  aria-expanded={shopOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    shopOpen || shopActive
                      ? "text-brand-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      shopOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </li>
            )
          )}
        </ul>

        <div className="flex-1" />

        {/* ── Compact search (desktop) ──────────────────────── */}
        <div className="hidden lg:block w-48 xl:w-64 xl:focus-within:w-80 transition-[width] duration-300">
          <SearchBar compact placeholder="Search products, brands & models" />
        </div>

        {/* ── WhatsApp CTA (desktop) ────────────────────────── */}
        <a
          href="https://wa.me/923001234567"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors shrink-0"
        >
          <Phone className="w-4 h-4" />
          WhatsApp
        </a>

        {/* ── Mobile toggle ─────────────────────────────────── */}
        <button
          className="lg:hidden p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* ── Shop mega-menu (desktop) — full category tree ──────── */}
      {shopOpen && (
        <div className="hidden lg:block absolute top-full inset-x-0 z-50">
          <div className="bg-surface-dark/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              {/* Header row */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  Shop by Category
                </p>
                <Link
                  to="/products"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View All Products
                </Link>
              </div>

              {/* Category columns */}
              {tree.length ? (
                <div className="grid grid-cols-5 gap-6 xl:gap-10">
                  {tree.map((cat) => (
                    <div key={cat.slug} className="min-w-0">
                      <Link
                        to={`/products?category=${cat.slug}`}
                        className="group flex items-baseline justify-between gap-2 border-b border-white/10 pb-2 mb-2.5"
                      >
                        <span className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-gray-600 shrink-0">
                          {cat.total_count ?? 0}
                        </span>
                      </Link>
                      <ul>
                        {cat.children.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              to={`/products?category=${sub.slug}`}
                              className="block py-1 text-[13px] text-gray-400 hover:text-brand-400 transition-colors truncate"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-gray-500">
                  Loading categories…
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {open && (
        <div className="lg:hidden border-t border-white/5 bg-surface-dark max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Search */}
          <div className="px-4 py-3 border-b border-white/5">
            <SearchBar compact placeholder="Search products, brands & models" />
          </div>

          <ul className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) =>
              link.to ? (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? "text-brand-400 bg-brand-600/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ) : (
                <li key={link.label}>
                  {/* Shop — link + expandable category list */}
                  <div className="flex items-center">
                    <Link
                      to="/products"
                      onClick={() => setOpen(false)}
                      className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        shopActive
                          ? "text-brand-400 bg-brand-600/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      Shop
                    </Link>
                    <button
                      onClick={() => setShopExpanded(!shopExpanded)}
                      className="p-2.5 text-gray-500 hover:text-white"
                      aria-label={
                        shopExpanded ? "Collapse categories" : "Expand categories"
                      }
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          shopExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {shopExpanded && (
                    <ul className="ml-5 pl-4 border-l border-white/10 py-1 space-y-0.5">
                      {tree.map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            to={`/products?category=${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-gray-600">
                              {cat.total_count ?? 0}
                            </span>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          to="/products"
                          onClick={() => setOpen(false)}
                          className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-400 hover:bg-brand-600/5 transition-colors"
                        >
                          View All Products
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )
            )}

            <li className="pt-3">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp Us
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
