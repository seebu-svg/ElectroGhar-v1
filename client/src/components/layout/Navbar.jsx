import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import logo from "../../assets/logo.png";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "All Laptops" },
  { to: "/products?category=business-laptops", label: "Business" },
  { to: "/products?category=gaming-laptops", label: "Gaming" },
  { to: "/products?category=student-laptops", label: "Student" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group">
          <img src={logo} alt="ElectroGhar" className="h-11 sm:h-12 w-auto" />
        </Link>

        {/* ── Desktop Nav ──────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-600 bg-brand-50"
                      : "text-gray-600 hover:text-brand-600 hover:bg-brand-50/50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            WhatsApp Us
          </a>
        </div>

        {/* ── Mobile Toggle ────────────────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* ── Mobile Menu ──────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <ul className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "text-brand-600 bg-brand-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="pt-2">
              <a
                href="https://wa.me/923001234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold"
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
