import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import logoFull from "../../assets/logo-full.png";

export default function Footer() {
  return (
    <footer className="relative bg-surface-dark text-gray-300">
      {/* Red glow top edge */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/70 to-transparent" />
      <div className="absolute -top-20 inset-x-0 h-40 glow-blob pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* ── Brand ──────────────────────────────────────────── */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logoFull} alt="ElectroGhar" className="h-16 sm:h-20 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Pakistan&apos;s trusted store for quality checked laptops, PCs,
              monitors, storage and gadgets — new, used and refurbished.
            </p>
          </div>

          {/* ── Quick Links ────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Laptops", to: "/products?category=laptops" },
                { label: "PCs & Desktops", to: "/products?category=pcs-desktops" },
                { label: "Monitors & Displays", to: "/products?category=monitors-displays" },
                { label: "Storage & Accessories", to: "/products?category=storage-accessories" },
                { label: "Gadgets & Electronics", to: "/products?category=gadgets-electronics" },
                { label: "All Products", to: "/products" },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-brand-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Warranty Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* ── Contact ────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                <span>Lahore, Punjab, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+923001234567" className="hover:text-brand-400 transition-colors">
                  +92 300 1234567
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:hello@electroghar.pk" className="hover:text-brand-400 transition-colors">
                  hello@electroghar.pk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Mon–Sat: 10am – 8pm</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} ElectroGhar. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
