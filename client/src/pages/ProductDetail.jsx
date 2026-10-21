import { productMetadata } from '../utils/seoData.mjs';
import { POLICY, productPolicy } from '../utils/policies';
import { CONTACT } from '../utils/contact';
import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Battery, ChevronDown, ChevronLeft, ChevronRight, Cpu, HardDrive, MemoryStick, MessageCircle, SearchX, ShieldCheck, X, ZoomIn } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import Breadcrumb from '../components/ui/Breadcrumb';
import placeholderImg from '../assets/product-placeholder.webp';
import { api } from '../utils/api';
import { formatPrice, buildWhatsAppLink, discountPercent } from '../utils/helpers';
import { SEOHead, productSchema, breadcrumbSchema } from '../utils/seo';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-control';
const secondary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-arctic/5 px-5 text-sm font-semibold text-content transition-colors hover:bg-arctic/10 ${focus}`;
const fallbackImage = e => { if (e.currentTarget.getAttribute('src') !== placeholderImg) e.currentTarget.src = placeholderImg; };

function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dialog = useRef(null);
  const next = delta => setIndex(i => (i + delta + images.length) % images.length);
  useEffect(() => {
    if (!expanded) return;
    const node = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; };
  }, [expanded]);
  const arrow = `flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface-dark/85 text-content hover:bg-surface-card ${focus}`;
  return <div className="min-w-0 lg:sticky lg:top-24">
    <div className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-card">
      <button type="button" onClick={() => setExpanded(true)} aria-label={`Enlarge ${name}, image ${index + 1}`} className={`h-full w-full p-5 sm:p-8 ${focus}`}><img src={images[index]} alt={`${name} — image ${index + 1}`} width="800" height="800" fetchPriority="high" decoding="async" onError={fallbackImage} className="h-full w-full object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.04] motion-reduce:transition-none" /><span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-lg border border-line bg-surface-dark/80 px-3 py-2 text-xs text-muted"><ZoomIn size={15} />Tap to enlarge</span></button>
      {images.length > 1 && <><button type="button" aria-label="Previous image" onClick={() => next(-1)} className={`absolute left-3 top-1/2 -translate-y-1/2 ${arrow}`}><ChevronLeft size={20} /></button><button type="button" aria-label="Next image" onClick={() => next(1)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${arrow}`}><ChevronRight size={20} /></button></>}
      <span aria-live="polite" className="absolute bottom-5 right-4 rounded-lg bg-surface-dark/80 px-3 py-1.5 text-xs tabular-nums text-muted">{index + 1} / {images.length}</span>
    </div>
    {images.length > 1 && <div aria-label="Product images" className="mt-3 flex gap-3 overflow-x-auto p-1">{images.map((image, i) => <button type="button" key={`${image}-${i}`} onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} aria-pressed={index === i} className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-surface-card p-2 ${focus} ${index === i ? 'border-brand-400 ring-2 ring-control/15' : 'border-line hover:border-line'}`}><img src={image} alt="" width="80" height="80" loading="lazy" onError={fallbackImage} className="h-full w-full object-contain" /></button>)}</div>}
    {expanded && <dialog ref={dialog} aria-label={`${name} image viewer`} onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)} onKeyDown={e => { if (e.key === 'ArrowLeft') { e.preventDefault(); next(-1); } if (e.key === 'ArrowRight') { e.preventDefault(); next(1); } }} className="fixed inset-0 m-auto h-[95dvh] max-h-none w-[96vw] max-w-6xl rounded-2xl border border-line bg-surface-dark p-4 text-content shadow-2xl backdrop:bg-midnight/85 sm:p-6"><div className="flex items-center justify-between gap-4"><p className="truncate text-sm text-muted">{name}</p><button type="button" autoFocus aria-label="Close image viewer" onClick={() => setExpanded(false)} className={arrow}><X size={20} /></button></div><img src={images[index]} alt={`${name} — image ${index + 1}`} onError={fallbackImage} className="h-[calc(95dvh-10rem)] w-full object-contain p-3" /><div className="flex items-center justify-center gap-5"><button type="button" disabled={images.length < 2} aria-label="Previous enlarged image" onClick={() => next(-1)} className={`${arrow} disabled:opacity-30`}><ChevronLeft size={20} /></button><span aria-live="polite" className="text-sm tabular-nums text-muted">{index + 1} / {images.length}</span><button type="button" disabled={images.length < 2} aria-label="Next enlarged image" onClick={() => next(1)} className={`${arrow} disabled:opacity-30`}><ChevronRight size={20} /></button></div></dialog>}
  </div>;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [categories, setCategories] = useState([]);
  useEffect(() => { let active = true; api.getCategories().then(r => { if (active) setCategories(r.categories || []); }).catch(() => {}); return () => { active = false; }; }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setData(null);
    api.getProduct(slug).then(res => { if (active) setData(res); }).catch(e => { if (active && e.status !== 404) setError('We couldn’t load this product. Please try again.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, retry]);

  if (loading) return <div role="status" aria-label="Loading product" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2"><div className="aspect-square rounded-2xl bg-surface-card motion-safe:animate-pulse" /><div className="space-y-6 py-4"><div className="h-6 w-24 rounded bg-surface-card motion-safe:animate-pulse" /><div className="h-10 w-4/5 rounded bg-surface-card motion-safe:animate-pulse" /><div className="h-20 rounded bg-surface-card motion-safe:animate-pulse" /><div className="h-56 rounded-2xl bg-surface-card motion-safe:animate-pulse" /></div></div>;
  if (!data?.product) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><SEOHead title={error ? 'Unable to load product' : 'Product Not Found'} noIndex /><SearchX size={32} className="mx-auto mb-5 text-brand-300" /><h1 className="text-2xl font-bold text-content">{error ? 'Let’s try that again' : 'Product not found'}</h1><p role={error ? 'alert' : undefined} className="mt-3 text-sm leading-6 text-muted">{error || 'This product may have been removed from the catalog. Explore our current selection.'}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{error && <button type="button" onClick={() => setRetry(r => r + 1)} className={secondary}>Try again</button>}<Link to="/products" className={secondary}>Browse products<ArrowRight size={16} /></Link></div></div>;

  const { product, related } = data;
  const policy = productPolicy(product);
  const meta = productMetadata(product);
  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const images = Array.isArray(product.images) ? product.images.filter(image => typeof image === 'string' && image.trim()) : [];
  if (!images.length) images.push(product.thumbnail_url || placeholderImg);
  const price = Number(product.price);
  const hasPrice = Number.isFinite(price) && price > 0;
  const discount = hasPrice ? discountPercent(price, Number(product.compare_at_price)) : 0;
  const savings = discount > 0 ? Number(product.compare_at_price) - price : 0;
  const soldOut = product.is_available === false || (product.stock_qty != null && Number(product.stock_qty) === 0);
  const available = !soldOut && (product.is_available === true || Number(product.stock_qty) > 0);
  const whatsappLink = buildWhatsAppLink(CONTACT.internationalPhone, product.name, product.slug);
  const orderMessage = `Hi ElectroGhar! I'd like to order ${product.name}.\n${productUrl}\nPlease confirm the price, availability and delivery details.`;
  const orderLink = soldOut || !available ? whatsappLink : `${CONTACT.whatsappUrl}?text=${encodeURIComponent(orderMessage)}`;
  const actionLabel = soldOut || !available ? 'Ask about availability' : 'Order on WhatsApp';
  const priceLabel = hasPrice ? formatPrice(price) : 'Contact for price';
  const categoryName = categories.find(c => c.slug === product.category)?.name || product.category?.replace(/-/g, ' ');
  const specifications = Object.entries(product.specs || {}).filter(([, value]) => value != null && String(value).trim());
  const quickSpecs = [['processor', 'Processor', Cpu], ['ram', 'Memory', MemoryStick], ['storage', 'Storage', HardDrive]].filter(([key]) => product.specs?.[key]);
  const description = String(product.description || '').replace(/<[^>]*>/g, ' ').trim();
  const primary = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-action px-5 text-sm font-semibold text-content transition-colors hover:bg-action-hover ${focus}`;
  return <div className="min-h-screen bg-surface pb-28 md:pb-0 [&_button]:cursor-pointer">
    <SEOHead title={meta.title} description={meta.description} canonical={productUrl} image={product.thumbnail_url || images[0]} type="product" jsonLd={[productSchema(product), breadcrumbSchema([{ label: 'Products', to: `${window.location.origin}/products` }, ...(product.category ? [{ label: categoryName, to: `${window.location.origin}/products?category=${encodeURIComponent(product.category)}` }] : []), { label: product.name, to: productUrl }])]} />
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8"><Breadcrumb items={[{ label: 'Products', to: '/products' }, ...(product.category ? [{ label: categoryName, to: `/products?category=${encodeURIComponent(product.category)}` }] : []), { label: product.name }]} /></div>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <Gallery key={slug} images={images} name={product.name} />
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{product.brand || categoryName}</p><h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-content sm:text-4xl">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">{[...new Set([product.condition_type, product.condition_grade].filter(Boolean))].map(value => <span key={value} className="rounded-lg border border-line bg-arctic/5 px-3 py-1.5 capitalize text-muted">{value}</span>)}<span className={`inline-flex items-center gap-2 px-2 py-1.5 ${soldOut ? 'text-muted' : available ? 'text-success' : 'text-muted'}`}><span className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-success' : 'bg-surface-card'}`} />{soldOut ? 'Currently sold out' : available ? 'Available now' : 'Confirm availability'}</span></div>
          {description && <p className="mt-5 line-clamp-3 text-sm leading-7 text-muted">{description}</p>}
          {quickSpecs.length > 0 && <dl className="mt-6 grid grid-cols-3 gap-3">{quickSpecs.map(([key, label, Icon]) => <div key={key} className="min-w-0 rounded-xl border border-line bg-surface-card p-3"><dt className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted"><Icon size={14} />{label}</dt><dd className="mt-2 break-words text-xs font-medium leading-5 text-content">{String(product.specs[key])}</dd></div>)}</dl>}
          <div className="mt-6 rounded-2xl border border-line bg-surface-card p-5 sm:p-6"><p className="text-xs text-muted">{soldOut ? 'Listed price' : 'Product price'}</p><div className="mt-2 flex flex-wrap items-center gap-3"><p className="text-3xl font-bold tracking-tight text-content sm:text-4xl">{priceLabel}</p>{discount > 0 && <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-xs font-semibold text-brand-300">{discount}% off</span>}</div>{savings > 0 && <p className="mt-2 text-sm"><span className="mr-3 text-muted line-through">{formatPrice(product.compare_at_price)}</span><span className="text-success">Save {formatPrice(savings)}</span></p>}
            {policy.asIs && <p className="mt-4 rounded-xl border border-warning/20 bg-warning/5 p-3 text-xs font-semibold leading-6 text-warning">{POLICY.asIsLabel}</p>}
            <a href={orderLink} target="_blank" rel="noopener noreferrer" className={`${primary} mt-5 w-full`}><MessageCircle size={18} />{actionLabel}<span className="sr-only"> (opens in a new tab)</span></a><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={`mt-2 flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm text-muted hover:text-content ${focus}`}>Ask a question<ArrowUpRight size={15} /><span className="sr-only"> (opens in a new tab)</span></a><p className="mt-2 text-center text-xs leading-5 text-muted">Opens WhatsApp to confirm price, availability and delivery. No payment is taken here.</p>
          </div>
          <div className="mt-5 space-y-3 text-xs leading-6 text-muted">{policy.warranty && <p className="flex items-start gap-2"><ShieldCheck size={16} className="mt-1 shrink-0 text-brand-300" /><span>{policy.warranty}{policy.laptop && !policy.asIs && <span className="block text-muted">Limited coverage on eligible functional laptops. <a href="#purchase-terms" className={`rounded text-brand-300 ${focus}`}>See purchase terms</a></span>}</span></p>}{product.battery_health && <p className="flex items-center gap-2"><Battery size={16} className="text-muted" />Battery health: {product.battery_health}</p>}</div>
        </div>
      </div>
      <nav aria-label="Product information" className="mt-10 flex gap-2 overflow-x-auto border-y border-line py-3 sm:mt-14">{[['overview', 'Overview'], ['specifications', 'Specifications'], ['purchase-terms', 'Purchase terms']].map(([id, label]) => <a key={id} href={`#${id}`} className={`inline-flex min-h-11 shrink-0 items-center rounded-xl px-4 text-sm font-medium text-muted hover:bg-arctic/5 hover:text-content ${focus}`}>{label}</a>)}</nav>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
        <section id="overview" className="scroll-mt-28"><p className="text-xs uppercase tracking-[0.16em] text-brand-300">A closer look</p><h2 className="mt-2 text-2xl font-semibold text-content">About this product</h2><div className="mt-5 max-w-prose space-y-4 text-sm leading-7 text-muted">{description ? description.split(/\n+/).filter(Boolean).map((paragraph, i) => <p key={i}>{paragraph}</p>) : <p>Contact our team for more information about this product’s condition, features and suitability.</p>}</div></section>
        <section id="specifications" className="min-w-0 scroll-mt-28"><h2 className="text-2xl font-semibold text-content">Specifications</h2>{specifications.length ? <dl className="mt-5 overflow-hidden rounded-2xl border border-line">{specifications.map(([key, value], i) => <div key={key} className={`grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-4 px-4 py-4 text-sm sm:px-5 ${i % 2 === 0 ? 'bg-surface-card' : 'bg-arctic/[0.015]'}`}><dt className="break-words capitalize text-muted">{key.replace(/_/g, ' ')}</dt><dd className="break-words font-medium text-content">{String(value)}</dd></div>)}</dl> : <p className="mt-5 rounded-xl border border-line p-5 text-sm leading-6 text-muted">Detailed specifications are not listed yet. Ask our team for the information you need.</p>}</section>
      </div>
      <section id="purchase-terms" className="mt-12 scroll-mt-28"><h2 className="text-2xl font-semibold text-content">Before you order</h2><p className="mt-2 text-sm text-muted">Review the coverage and purchase terms for this product.</p><div className="mt-5 overflow-hidden rounded-2xl border border-line bg-surface-card">{[
        ['Warranty & eligibility', policy.asIs ? POLICY.asIs : policy.laptop ? `${POLICY.warranty} ${POLICY.exclusions}` : policy.warranty || 'Contact us to confirm whether warranty coverage applies to this product.'],
        ['Refunds & returns', `${POLICY.refunds} ${POLICY.returns}`],
        ['Claims & your rights', `${policy.laptop && !policy.asIs ? POLICY.claims : ''} ${POLICY.rights}`],
      ].map(([title, text]) => <details key={title} className="group border-b border-line last:border-0"><summary className={`flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-content [&::-webkit-details-marker]:hidden ${focus}`}>{title}<ChevronDown size={16} className="shrink-0 text-muted group-open:rotate-180" /></summary><p className="max-w-4xl px-5 pb-5 text-sm leading-7 text-muted">{text}</p></details>)}</div><Link to="/faqs" className={`mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-brand-300 hover:text-content ${focus}`}>Read all FAQs & purchase policies<ArrowRight size={15} /></Link></section>
      {related?.length > 0 && <section className="mt-12"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><h2 className="text-2xl font-semibold text-content">You may also like</h2><Link to="/products" className={secondary}>Browse all products<ArrowRight size={16} /></Link></div><div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-5">{related.map(item => <ProductCard key={item.id} product={item} variant="featured" />)}</div></section>}
    </div>
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-surface-dark/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"><div className="min-w-0"><p className="truncate text-[11px] text-muted">{soldOut ? 'Currently sold out' : 'Product price'}</p><p className="mt-1 text-sm font-bold text-content">{priceLabel}</p></div><a href={orderLink} target="_blank" rel="noopener noreferrer" className={`${primary} max-w-[60%] px-3 text-xs`}><MessageCircle size={17} className="shrink-0" />{actionLabel}<span className="sr-only"> (opens in a new tab)</span></a></div>
  </div>;
}
