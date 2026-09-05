import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

/**
 * SEO-friendly breadcrumb navigation.
 * items: [{ label: string, to?: string }]
 * The last item is rendered as current page text.
 */
export default function Breadcrumb({ items, className = "" }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`inline-flex items-center gap-1.5 text-sm text-gray-500 bg-surface-card/70 backdrop-blur-sm border border-white/5 rounded-full px-4 py-2 max-w-full ${className}`}
    >
      <Link
        to="/"
        className="hover:text-brand-400 transition-colors shrink-0 inline-flex items-center gap-1"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, idx) => (
        <span key={idx} className="inline-flex items-center gap-1.5 shrink-0">
          <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
          {item.to && idx !== items.length - 1 ? (
            <Link
              to={item.to}
              className="hover:text-brand-400 transition-colors truncate"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-200 font-medium truncate">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
