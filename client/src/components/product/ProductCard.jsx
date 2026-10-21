import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Cpu, HardDrive, MemoryStick, MessageCircle, ShieldCheck } from 'lucide-react';
import { CONTACT } from '../../utils/contact';
import { buildWhatsAppLink, formatPrice } from '../../utils/helpers';
import { productCardData } from '../../utils/productCardData.mjs';
import placeholderImg from '../../assets/product-placeholder.webp';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-control';

export default function ProductCard({ product, badge }) {
  const card = productCardData(product);
  return <Card key={`${product.id || product.slug}:${card.images.join('|')}`} product={product} card={card} badge={badge} />;
}

function Card({ product, card, badge }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = card.images.length ? card.images : [placeholderImg];
  const url = `/product/${product.slug}`;
  const specs = [['Processor', product.specs?.processor, Cpu], ['RAM', product.specs?.ram, MemoryStick], ['Storage', product.specs?.storage, HardDrive]].filter(([, value]) => (typeof value === 'string' && value.trim()) || (typeof value === 'number' && Number.isFinite(value) && value > 0));
  const inquiry = buildWhatsAppLink(CONTACT.internationalPhone, card.name, product.slug);
  return <article className="product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface-card transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:border-brand-400/30 hover:shadow-xl hover:shadow-midnight/20 motion-reduce:transition-none">
    <div className="product-card-media border-b border-line bg-surface-card">
      <Link to={url} aria-label={`View ${card.title}`} className={`absolute inset-0 ${focus}`}>
        <img key={images[activeImage]} src={images[activeImage]} alt={`${card.title}${images.length > 1 ? ` — view ${activeImage + 1}` : ''}`} width="640" height="480" loading="lazy" decoding="async" onError={e => { if (e.currentTarget.getAttribute('src') !== placeholderImg) e.currentTarget.src = placeholderImg; }} className={`product-card-image ${card.soldOut ? 'opacity-65' : ''}`} />
      </Link>
      {badge && <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md border border-brand-400/25 bg-surface-dark/95 px-2 py-1 text-[10px] font-semibold text-brand-300">{badge}</span>}
      {card.hasDiscount && card.discount > 0 && <span className="pointer-events-none absolute left-2.5 top-2.5 rounded-md bg-action px-2 py-1 text-[11px] font-semibold text-content">−{card.discount}%</span>}
      {images.length > 1 && <><div className="product-image-controls absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-line bg-surface-dark/90 p-0.5 text-content"><button type="button" onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)} title="Previous image" aria-label={`Previous image of ${card.name}`} className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-arctic/10 ${focus}`}><ChevronLeft size={15} /></button><span aria-live="polite" className="min-w-6 text-center text-[10px] tabular-nums text-muted">{activeImage + 1}/{images.length}</span><button type="button" onClick={() => setActiveImage(i => (i + 1) % images.length)} title="Next image" aria-label={`Next image of ${card.name}`} className={`flex h-9 w-9 items-center justify-center rounded-full hover:bg-arctic/10 ${focus}`}><ChevronRight size={15} /></button></div></>}
    </div>
    <div className="flex flex-1 flex-col p-3 sm:p-4">
      <h3 className="min-h-10 text-sm font-semibold leading-5 tracking-tight text-content sm:min-h-11 sm:text-[15px] sm:leading-[22px]"><Link to={url} title={card.title} className={`line-clamp-2 rounded transition-colors hover:text-brand-300 ${focus}`}>{card.title}</Link></h3>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="product-card-price font-bold leading-tight tracking-tight text-content">{card.hasPrice ? formatPrice(card.price) : 'Contact for price'}</p>
        {card.hasDiscount && <p className="text-[11px] leading-4 text-muted line-through"><span className="sr-only">Original price </span>{formatPrice(card.original)}</p>}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] leading-4">
        {card.condition && <p title={card.condition} className="min-w-0 truncate capitalize text-muted">{card.condition}</p>}
        <p className={`flex items-center gap-1.5 ${card.inStock ? 'text-success' : 'text-muted'}`}><span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${card.inStock ? 'bg-success' : 'bg-surface-card'}`} />{card.stock}</p>
      </div>
      {specs.length > 0 && <dl className="mt-2 flex flex-wrap gap-1.5">{specs.map(([label, value, Icon]) => <div key={label} title={`${label}: ${value}`} className="flex min-w-0 max-w-full items-center gap-1 rounded-md border border-line bg-arctic/[0.03] px-1.5 py-1 text-[10px] leading-3.5"><dt className="shrink-0 text-muted"><Icon size={11} aria-hidden="true" /><span className="sr-only">{label}: </span></dt><dd className="truncate text-muted">{value}</dd></div>)}</dl>}
      {(card.warranty === '30-Day Checking Warranty' || card.asIs) && <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-4 text-muted"><ShieldCheck size={12} aria-hidden="true" />{card.warranty}</p>}
      <div className="mt-auto pt-1">
        <div className="mt-3 flex gap-2"><Link to={url} title="View Details" aria-label={`View details of ${card.title}`} className={`flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg bg-action px-2 text-center text-xs font-semibold text-content transition-colors hover:bg-action-hover ${focus}`}>View Details</Link><a href={inquiry} target="_blank" rel="noopener noreferrer" title="Inquire on WhatsApp" aria-label={`Inquire about ${card.title} on WhatsApp (opens in a new tab)`} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-arctic/[0.03] text-muted transition-colors hover:border-success/40 hover:bg-success/10 hover:text-success ${focus}`}><MessageCircle size={17} aria-hidden="true" /></a></div>
      </div>
    </div>
  </article>;
}
