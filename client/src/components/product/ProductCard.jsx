import { Link } from "react-router-dom";
import { Cpu, HardDrive, Monitor, MemoryStick, Phone } from "lucide-react";
import { formatPrice, conditionColor, discountPercent, buildWhatsAppLink } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.png";

export default function ProductCard({ product, showAskPrice = false }) {
  const { name, slug, brand, price, compare_at_price, images, thumbnail_url, condition_grade, condition_type, specs } = product;
  const discount = discountPercent(price, compare_at_price);
  const imgUrl = thumbnail_url || (Array.isArray(images) && images[0]) || placeholderImg;

  return (
    <Link
      to={`/product/${slug}`}
      className="group flex flex-col bg-surface-card rounded-2xl border border-white/5 shadow-lg shadow-black/30 hover:border-brand-600/50 hover:shadow-brand-600/15 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-surface-dark overflow-hidden">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Cinematic bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-card to-transparent pointer-events-none" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-brand-600/40">
            -{discount}%
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${conditionColor(condition_grade)}`}>
          {condition_grade}
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1 flex items-center gap-1.5 overflow-hidden">
          <span className="truncate">{brand}</span>
          {condition_type && (
            <span className="capitalize text-gray-500 font-medium normal-case tracking-normal shrink-0 whitespace-nowrap">
              · {condition_type}
            </span>
          )}
        </p>
        <h3 className="text-sm font-semibold text-gray-100 line-clamp-2 min-h-10 mb-3 group-hover:text-brand-300 transition-colors">
          {name}
        </h3>

        {/* ── Quick Specs (fixed height keeps cards uniform) ── */}
        <div className="grid grid-cols-2 gap-1.5 mb-3 h-10 overflow-hidden">
          {specs?.processor && (
            <SpecPill icon={<Cpu className="w-3 h-3" />} text={specs.processor} />
          )}
          {specs?.ram && (
            <SpecPill icon={<MemoryStick className="w-3 h-3" />} text={specs.ram} />
          )}
          {specs?.storage && (
            <SpecPill icon={<HardDrive className="w-3 h-3" />} text={specs.storage} />
          )}
          {specs?.display && (
            <SpecPill icon={<Monitor className="w-3 h-3" />} text={specs.display} />
          )}
        </div>

        {/* ── Price & CTA (pinned to card bottom) ─────────── */}
        <div className="pt-2 border-t border-white/5 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-lg font-bold text-white shrink-0">
                {formatPrice(price)}
              </span>
              {compare_at_price && compare_at_price > price && (
                <span className="text-xs text-gray-500 line-through truncate">
                  {formatPrice(compare_at_price)}
                </span>
              )}
            </div>
            {showAskPrice && (
              <a
                href={buildWhatsAppLink(product.whatsapp_number || "+923001234567", product.name, product.slug)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white hover:bg-green-500 hover:shadow-lg hover:shadow-green-600/40 transition-all shrink-0"
                aria-label="Ask price on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {showAskPrice && (
            <p className="text-xs text-brand-400 font-medium mt-1.5">Ask Latest Price</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SpecPill({ icon, text }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );
}
