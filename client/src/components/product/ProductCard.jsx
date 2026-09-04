import { Link } from "react-router-dom";
import { Cpu, HardDrive, Monitor, MemoryStick, Phone } from "lucide-react";
import { formatPrice, conditionColor, discountPercent, buildWhatsAppLink } from "../../utils/helpers";
import placeholderImg from "../../assets/product-placeholder.png";

export default function ProductCard({ product, showAskPrice = false }) {
  const { name, slug, brand, price, compare_at_price, images, thumbnail_url, condition_grade, specs } = product;
  const discount = discountPercent(price, compare_at_price);
  const imgUrl = thumbnail_url || (Array.isArray(images) && images[0]) || placeholderImg;

  return (
    <Link
      to={`/product/${slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300 overflow-hidden"
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        <img
          src={imgUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${conditionColor(condition_grade)}`}>
          {condition_grade}
        </span>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="p-4">
        <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">
          {brand}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3 group-hover:text-brand-600 transition-colors">
          {name}
        </h3>

        {/* ── Quick Specs ──────────────────────────────────── */}
        {specs && (
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {specs.processor && (
              <SpecPill icon={<Cpu className="w-3 h-3" />} text={specs.processor} />
            )}
            {specs.ram && (
              <SpecPill icon={<MemoryStick className="w-3 h-3" />} text={specs.ram} />
            )}
            {specs.storage && (
              <SpecPill icon={<HardDrive className="w-3 h-3" />} text={specs.storage} />
            )}
            {specs.display && (
              <SpecPill icon={<Monitor className="w-3 h-3" />} text={specs.display} />
            )}
          </div>
        )}

        {/* ── Price & CTA ────────────────────────────────── */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {compare_at_price && compare_at_price > price && (
                <span className="ml-2 text-xs text-gray-400 line-through">
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
                className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors shrink-0"
                aria-label="Ask price on WhatsApp"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          {showAskPrice && (
            <p className="text-xs text-brand-600 font-medium mt-1.5">Ask Latest Price</p>
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
