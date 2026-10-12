import { Link } from "react-router-dom";
import { Cpu, HardDrive, Monitor, MemoryStick, Phone, Eye, Sparkles, Tag } from "lucide-react";
import { formatPrice, conditionColor, discountPercent, buildWhatsAppLink } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.png";

export default function ProductCard({ product, showAskPrice = false }) {
  const {
    name,
    slug,
    brand,
    price,
    compare_at_price,
    images,
    thumbnail_url,
    condition_grade,
    condition_type,
    specs,
    is_available,
    stock_qty,
    is_featured,
  } = product;

  const discount = discountPercent(price, compare_at_price);
  const savings = compare_at_price && compare_at_price > price ? compare_at_price - price : 0;
  const imgUrl = thumbnail_url || (Array.isArray(images) && images[0]) || placeholderImg;
  const imageCount = Array.isArray(images) ? images.filter(Boolean).length : 0;
  const isLowStock = is_available && stock_qty > 0 && stock_qty <= 3;
  const isOutOfStock = !is_available || stock_qty === 0;

  return (
    <Link
      to={`/product/${slug}`}
      className="group relative flex flex-col bg-surface-card rounded-2xl border border-white/5 shadow-lg shadow-black/30 hover:border-brand-500/40 hover:shadow-brand-600/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
    >
      {/* ── Image Area ─────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-surface-dark to-surface-card overflow-hidden">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-gray-900 text-xs font-semibold shadow-lg">
              <Eye className="w-3.5 h-3.5" />
              View Details
            </span>
          </div>
        </div>

        {/* Top badges row */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30">
              <Tag className="w-3 h-3" />
              -{discount}%
            </span>
          )}
          {condition_type === "new" && (
            <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-3 h-3" />
              New
            </span>
          )}
          {is_featured && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-amber-500/30">
              <Sparkles className="w-3 h-3" />
              Popular
            </span>
          )}
        </div>

        {/* Condition badge (top right) */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide shadow-md ${conditionColor(condition_grade)}`}>
          {condition_grade}
        </span>

        {/* Image count badge */}
        {imageCount > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium">
            <Eye className="w-3 h-3" />
            {imageCount}
          </span>
        )}

        {/* Cinematic bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface-card via-surface-card/80 to-transparent pointer-events-none" />

        {/* Stock indicator */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-red-500/90 text-white text-sm font-bold uppercase tracking-wide">
              Sold Out
            </span>
          </div>
        )}
        {isLowStock && (
          <span className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wide">
            Only {stock_qty} left
          </span>
        )}
      </div>

      {/* ── Content ────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Brand + Condition type */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider truncate">
            {brand}
          </span>
          {condition_type && condition_type !== "new" && (
            <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded capitalize">
              {condition_type}
            </span>
          )}
        </div>

        {/* Product name */}
        <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-brand-300 transition-colors leading-snug">
          {name}
        </h3>

        {/* ── Quick Specs ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 min-h-[2.5rem]">
          {specs?.processor && (
            <SpecPill icon={<Cpu className="w-3 h-3 text-brand-400" />} text={specs.processor} />
          )}
          {specs?.ram && (
            <SpecPill icon={<MemoryStick className="w-3 h-3 text-brand-400" />} text={specs.ram} />
          )}
          {specs?.storage && (
            <SpecPill icon={<HardDrive className="w-3 h-3 text-brand-400" />} text={specs.storage} />
          )}
          {specs?.display && (
            <SpecPill icon={<Monitor className="w-3 h-3 text-brand-400" />} text={specs.display} />
          )}
        </div>

        {/* ── Price & Actions ─────────────────────────────── */}
        <div className="pt-3 border-t border-white/5 mt-auto">
          <div className="flex items-end justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="text-lg font-extrabold text-white leading-none">
                {formatPrice(price)}
              </span>
              {compare_at_price && compare_at_price > price && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-500 line-through">
                    {formatPrice(compare_at_price)}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-400">
                    Save {formatPrice(savings)}
                  </span>
                </div>
              )}
            </div>

            {showAskPrice && !isOutOfStock && (
              <a
                href={buildWhatsAppLink(product.whatsapp_number || "+92339244435", product.name, product.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/30 hover:scale-110 transition-all shrink-0"
                aria-label="Ask price on WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SpecPill({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/[0.03] rounded-md px-2 py-1 truncate border border-white/5">
      {icon}
      <span className="truncate font-medium">{text}</span>
    </div>
  );
}
