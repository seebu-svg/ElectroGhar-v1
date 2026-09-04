import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import logo from "../../assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* ── Brand ──────────────────────────────────────────── */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img src={logo} alt="ElectroGhar" className="h-14 w-auto brightness-0 invert" />
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Pakistan&apos;s trusted marketplace for quality pre-owned laptops.
              Every device is inspected, tested, and backed by our warranty.
            </p>
          </div>

          {/* ── Quick Links ────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Business Laptops", to: "/products?category=business-laptops" },
                { label: "Gaming Laptops", to: "/products?category=gaming-laptops" },
                { label: "Student Laptops", to: "/products?category=student-laptops" },
                { label: "Ultrabooks", to: "/products?category=ultrabooks" },
                { label: "All Laptops", to: "/products" },
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
                <a href="#" className="hover:text-brand-400 transition-colors">
                  About Us
                </a>
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
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
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
