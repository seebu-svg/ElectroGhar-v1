import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { api } from "../../utils/api";
import { formatPrice } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.png";

/**
 * Search input with live product autocomplete.
 * Submitting navigates to /products?search=...
 * `compact` renders a slim header-friendly variant (no button).
 */
export default function SearchBar({
  placeholder = "Search laptops, PCs, monitors, gadgets...",
  compact = false,
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const timerRef = useRef(null);

  // Debounced suggestions
  useEffect(() => {
    clearTimeout(timerRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await api.suggestProducts(q);
        setSuggestions(res.products || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setOpen(false);
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={submit}>
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none ${
            compact ? "left-3.5 w-4 h-4" : "left-4 w-5 h-5"
          }`}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className={
            compact
              ? "w-full pl-9 pr-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-brand-600/60 focus:bg-surface-card transition-colors"
              : "w-full pl-12 pr-24 py-3.5 rounded-full border border-white/10 bg-surface-card text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 focus:shadow-lg focus:shadow-brand-600/20 transition-all"
          }
        />
        {!compact && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-full bg-brand-600 text-white text-sm font-semibold hover:bg-brand-500 transition-colors"
          >
            Search
          </button>
        )}
      </form>

      {/* Autocomplete dropdown */}
      {open && query.trim().length >= 2 && (
        <div
          className={`absolute top-full mt-2 rounded-2xl border border-white/10 bg-surface-dark/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden z-50 ${
            compact ? "right-0 w-80" : "left-0 right-0"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Searching…
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-5 py-6 text-sm text-gray-500">
              No products found for “{query.trim()}”
            </div>
          ) : (
            <>
              <div className="max-h-[22rem] overflow-y-auto">
                {suggestions.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <img
                      src={p.thumbnail_url || (Array.isArray(p.images) && p.images[0]) || placeholderImg}
                      alt=""
                      className="w-11 h-11 rounded-lg object-cover bg-surface-card border border-white/10 shrink-0"
                      onError={(e) => { e.currentTarget.src = placeholderImg; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-100 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.brand}
                        {p.condition_type && (
                          <span className="capitalize"> · {p.condition_type}</span>
                        )}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0">
                      {formatPrice(p.price)}
                    </span>
                  </Link>
                ))}
              </div>
              <button
                onClick={submit}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-brand-400 hover:text-brand-300 bg-brand-600/5 border-t border-white/5 transition-colors"
              >
                See all results for “{query.trim()}”
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
