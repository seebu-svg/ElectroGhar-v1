import { CONTACT } from './contact.js';
import { POLICY, productPolicy } from './policies.js';

// One public origin for canonical URLs, schema and sitemap (never derived from Host).
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || (typeof process !== 'undefined' && process.env.SITE_URL) || 'https://www.electroghar.pk').replace(/\/$/, '');
export const DEFAULT_DESCRIPTION = 'Shop new, used and refurbished laptops, desktops, monitors, mobile phones and accessories in Karachi at ElectroGhar. Compare specs and order via WhatsApp.';
export const HOME_TITLE = 'Used Laptops in Karachi & Electronics in Pakistan';
export const absoluteUrl = (path = '/') => new URL(path, `${SITE_URL}/`).href;
export const cleanText = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
export const summarize = (value, length = 160) => {
  const text = cleanText(value);
  return text.length <= length ? text : `${text.slice(0, length - 1).replace(/\s+\S*$/, '')}…`;
};
export function canonicalUrl(input = '/') {
  const url = new URL(input, `${SITE_URL}/`);
  const result = new URL(url.pathname.replace(/\/+$/, '') || '/', `${SITE_URL}/`);
  const allowed = url.pathname.replace(/\/$/, '') === '/products'
    ? ['category', 'brand', 'conditionType', 'featured', 'deals', 'page']
    : url.pathname.replace(/\/$/, '') === '/blogs' ? ['category', 'page'] : [];
  for (const key of allowed) {
    const value = url.searchParams.get(key);
    if (!value || (key === 'page' && (!/^\d+$/.test(value) || Number(value) <= 1))) continue;
    result.searchParams.set(key, key === 'page' ? String(Number(value)) : value);
  }
  return result.href;
}
export function isFilteredSearch(params) {
  return ['search', 'condition', 'maxPrice', 'minPrice', 'sort'].some(key => params.has(key));
}
export function productMetadata(product) {
  const specs = Object.entries(product.specs || {}).filter(([key, value]) => ['processor', 'ram', 'storage', 'display'].includes(key) && value).map(([, value]) => cleanText(value)).join(', ');
  const policy = productPolicy(product);
  const condition = cleanText(product.condition_type || product.condition_grade || '');
  return {
    title: (policy.asIs && /warranty/i.test(product.meta_title || "") ? "" : cleanText(product.meta_title)) || `${product.name}${condition ? ` (${condition})` : ''} in Karachi`,
    description: summarize((policy.asIs && /warranty/i.test(product.meta_description || "") ? "" : product.meta_description) || `${product.name}${specs ? `: ${specs}` : ''}. ${policy.asIs ? 'AS IS, no checking warranty.' : policy.laptop ? '30-day checking warranty from delivery.' : 'Explore specifications.'} Order from ElectroGhar, Karachi via WhatsApp.`),
  };
}
export function collectionMetadata({ category, brand = '', condition = '', featured = false, deals = false, page = 1 } = {}) {
  const name = [brand, condition && `${condition[0].toUpperCase()}${condition.slice(1)}`, category?.name || (brand ? 'Laptops & Electronics' : featured ? 'Best Sellers' : deals ? 'Daily Deals' : 'Laptops & Electronics')].filter(Boolean).join(' ');
  const title = `${name} in Karachi, Pakistan${page > 1 ? ` – Page ${page}` : ''}`;
  const intro = `Browse ${name.toLowerCase()} at ElectroGhar in Karachi. Compare available specifications, condition and prices, then confirm your order on WhatsApp. Visit our shop at Naaz Digital Plaza or ask about delivery in Pakistan.`;
  return { name, title, description: summarize(intro), intro };
}
export function organizationSchema() {
  return {
    '@context': 'https://schema.org', '@type': ['Organization', 'ElectronicsStore'], '@id': absoluteUrl('/#business'),
    name: 'ElectroGhar', url: absoluteUrl('/'), logo: absoluteUrl('/logo.png'), image: absoluteUrl('/logo-full.png'),
    description: DEFAULT_DESCRIPTION, telephone: CONTACT.internationalPhone,
    address: { '@type': 'PostalAddress', streetAddress: CONTACT.street, addressLocality: CONTACT.city, addressRegion: CONTACT.region, addressCountry: CONTACT.country },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '12:00', closes: '23:00' }],
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`ElectroGhar, ${CONTACT.address}`)}`,
    contactPoint: { '@type': 'ContactPoint', telephone: CONTACT.internationalPhone, contactType: 'customer service', availableLanguage: ['English', 'Urdu'] },
  };
}
export function productSchema(product) {
  const url = absoluteUrl(`/product/${encodeURIComponent(product.slug)}`);
  const policy = productPolicy(product);
  const images = [...new Set([product.thumbnail_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean))].map(absoluteUrl);
  const result = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, url, name: product.name,
    description: policy.asIs ? productMetadata(product).description : cleanText(product.description) || productMetadata(product).description,
    ...(images.length ? { image: images } : {}), sku: product.sku || product.slug,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    category: product.category,
    additionalProperty: Object.entries(product.specs || {}).filter(([, value]) => value !== null && value !== '' && typeof value !== 'object').map(([name, value]) => ({ '@type': 'PropertyValue', name: name.replace(/_/g, ' '), value: String(value) })),
  };
  // Missing/negotiable prices are not zero-price offers. Never infer inventory.
  if (product.price !== null && product.price !== undefined && product.price !== '' && Number.isFinite(Number(product.price)) && Number(product.price) > 0) {
    result.offers = {
      '@type': 'Offer', url, priceCurrency: product.currency || 'PKR', price: String(product.price),
      ...(typeof product.is_available === 'boolean' && Number.isFinite(Number(product.stock_qty)) && product.stock_qty != null ? { availability: product.is_available && Number(product.stock_qty) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } : {}),
      ...(['new', 'used', 'refurbished'].includes(product.condition_type) ? { itemCondition: `https://schema.org/${product.condition_type === 'new' ? 'New' : product.condition_type === 'refurbished' ? 'Refurbished' : 'Used'}Condition` } : {}),
      seller: { '@id': absoluteUrl('/#business') },
      ...(policy.laptop && !policy.asIs ? { warranty: { '@type': 'WarrantyPromise', durationOfWarranty: { '@type': 'QuantitativeValue', value: 30, unitCode: 'DAY' }, description: `${POLICY.warranty} ${POLICY.exclusions} ${POLICY.claims}` } } : {}),
    };
  }
  if (policy.asIs) result.additionalProperty.push({ '@type': 'PropertyValue', name: 'Sale condition', value: POLICY.asIsLabel });
  return result;
}
export const faqEntries = [
  ['Do eligible laptops have a checking warranty?', POLICY.warranty],
  ['What does the checking warranty exclude?', POLICY.exclusions],
  ['Can I get a refund or return a product?', `${POLICY.refunds} ${POLICY.returns}`],
  ['Are dead or faulty laptops covered?', POLICY.asIs],
  ['How can I make a warranty claim?', POLICY.claims],
];
export const faqSchema = () => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntries.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) });
export const STATIC_PAGES = {
  '/': { title: HOME_TITLE, description: DEFAULT_DESCRIPTION },
  '/about': { title: 'About ElectroGhar | Electronics Store in Karachi', description: 'Meet ElectroGhar, your local electronics store at Naaz Digital Plaza, Karachi. Explore new, used and refurbished tech with clear condition information.' },
  '/contact': { title: 'Contact ElectroGhar in Karachi | Shop & Hours', description: `Visit ${CONTACT.address}. Call ${CONTACT.phone}. Open Monday to Saturday, 12 PM to 11 PM.` },
  '/blogs': { title: 'Laptop Buying Guides & Tech Advice in Pakistan', description: 'Explore ElectroGhar laptop buying guides, product comparisons and practical electronics advice for shoppers in Karachi and across Pakistan.' },
  '/privacy': { title: 'Privacy Policy', description: 'How ElectroGhar handles your contact details, product inquiries and website data when you browse or order electronics via WhatsApp.' },
  '/terms': { title: 'Terms & Conditions', description: 'Read ElectroGhar ordering, delivery, warranty, refund and return terms, including final sales and applicable Pakistani consumer rights.' },
  '/warranty-policy': { title: 'Warranty Policy | 30-Day Checking Warranty', description: summarize(`${POLICY.warranty} ${POLICY.exclusions}`) },
  '/refund-policy': { title: 'Refund Policy | Final Sales', description: POLICY.refunds },
  '/return-policy': { title: 'Return Policy | Returns & Exchanges', description: POLICY.returns },
  '/faqs': { title: 'FAQs | Ordering, Warranty, Refunds & Returns', description: 'Answers about ElectroGhar’s 30-day checking warranty, AS IS laptops, final sales, and how to contact our Karachi store for a warranty claim.' },
};

export function breadcrumbData(items) {
  const trail = items[0]?.label === 'Home' ? items : [{ label: 'Home', to: '/' }, ...items];
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, item: absoluteUrl(item.to || '/') })) };
}
export function articleSchema(blog) {
  const url = absoluteUrl(`/blogs/${encodeURIComponent(blog.slug)}`);
  return { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: blog.title, description: blog.meta_description || blog.excerpt, url,
    ...(blog.cover_image ? { image: absoluteUrl(blog.cover_image) } : {}), datePublished: blog.published_at || blog.created_at, dateModified: blog.updated_at || blog.published_at || blog.created_at,
    author: { '@type': blog.author ? 'Person' : 'Organization', name: blog.author || 'ElectroGhar' }, publisher: { '@id': absoluteUrl('/#business') }, mainEntityOfPage: url };
}
