import { visibleCategorySlugs } from './catalog.js';
import { supabase } from '../config/supabase.js';
import { SITE_URL, STATIC_PAGES, canonicalUrl, collectionMetadata, productMetadata, productSchema, organizationSchema, faqSchema, isFilteredSearch, absoluteUrl, breadcrumbData, articleSchema } from '../../../client/src/utils/seoData.mjs';

export async function allRows(table, columns, configure = query => query) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await configure(supabase.from(table).select(columns)).order('id').range(offset, offset + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) return rows;
  }
}
export async function publicCategories() {
  const categories = await allRows('categories', 'id,slug,name,parent_id,updated_at', q => q.eq('is_active', true));
  const roots = new Set(categories.filter(c => !c.parent_id).map(c => c.id));
  return categories.filter(c => !c.parent_id || roots.has(c.parent_id));
}
export async function publicCatalog() {
  const [categories, products] = await Promise.all([
    publicCategories(), allRows('products', 'id,slug,category,brand,updated_at', q => q.eq('is_active', true)),
  ]);
  const slugs = new Set(categories.map(c => c.slug));
  return { categories, products: products.filter(p => slugs.has(p.category)) };
}

export const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[char]);
export function sitemapXml(entries) {
  if (entries.length > 50000) throw new Error('Sitemap exceeds 50,000 URLs; add a sitemap index before publishing this catalog.');
  const body = entries.map(({ loc, updated_at }) => {
    const date = updated_at && new Date(updated_at);
    const lastmod = date && !Number.isNaN(date.getTime()) ? `<lastmod>${date.toISOString()}</lastmod>` : '';
    return `<url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
export async function sitemapEntries() {
  const [{ categories, products }, blogs] = await Promise.all([publicCatalog(), allRows('blogs', 'id,slug,updated_at', q => q.eq('is_published', true))]);
  const occupied = new Set(products.map(product => product.category));
  const populatedCategories = categories.filter(category => occupied.has(category.slug) || categories.some(child => child.parent_id === category.id && occupied.has(child.slug)));
  const entries = [
    ...Object.keys(STATIC_PAGES).map(path => ({ loc: absoluteUrl(path) })), { loc: absoluteUrl('/products') },
    ...products.map(p => ({ loc: absoluteUrl(`/product/${encodeURIComponent(p.slug)}`), updated_at: p.updated_at })),
    ...blogs.map(b => ({ loc: absoluteUrl(`/blogs/${encodeURIComponent(b.slug)}`), updated_at: b.updated_at })),
    ...populatedCategories.map(c => ({ loc: canonicalUrl(`/products?category=${encodeURIComponent(c.slug)}`) })),
    ...[...new Set(products.map(p => p.brand).filter(Boolean))].map(brand => ({ loc: canonicalUrl(`/products?brand=${encodeURIComponent(brand)}`) })),
  ];
  return [...new Map(entries.map(entry => [entry.loc, entry])).values()];
}
export async function pageMetadata(input) {
  const url = new URL(input, SITE_URL);
  const path = url.pathname.replace(/\/$/, '') || '/';
  const canonical = canonicalUrl(input);
  const base = { canonical, status: 200, jsonLd: [organizationSchema()] };
  if (path.startsWith('/admin')) return { ...base, title: 'Administration', description: 'ElectroGhar administration.', noIndex: true };
  if (path.startsWith('/product/')) {
    const { data: product, error } = await supabase.from('products').select('*').eq('slug', decodeURIComponent(path.slice(9))).eq('is_active', true).maybeSingle();
    if (error) throw error;
    if (!product) return notFound(canonical);
    const categories = await visibleCategorySlugs();
    if (!categories.includes(product.category)) return notFound(canonical);
    return { ...base, ...productMetadata(product), image: product.thumbnail_url || product.images?.[0], jsonLd: [organizationSchema(), productSchema(product), breadcrumbData([{ label: "Products", to: "/products" }, { label: product.name, to: canonical }])] };
  }
  if (path === '/products') {
    const categories = await publicCategories();
    const category = categories.find(c => c.slug === url.searchParams.get('category'));
    const brand = url.searchParams.get('brand') || '';
    if (url.searchParams.has('category') && !category) return notFound(canonical);
    if (brand) {
      const { data, error } = await supabase.from('products').select('id').eq('is_active', true).eq('brand', brand).in('category', categories.map(c => c.slug)).limit(1).maybeSingle();
      if (error) throw error;
      if (!data) return notFound(canonical);
    }
    const meta = collectionMetadata({ category, brand, condition: url.searchParams.get('conditionType') || '', featured: url.searchParams.get('featured'), deals: url.searchParams.get('deals'), page: Number(url.searchParams.get('page')) || 1 });
    return { ...base, ...meta, noIndex: isFilteredSearch(url.searchParams), jsonLd: [...base.jsonLd, { '@type': 'CollectionPage', '@id': canonical, name: meta.name, url: canonical, description: meta.description }, breadcrumbData([{ label: "Products", to: "/products" }, ...(category || brand ? [{ label: meta.name, to: canonical }] : [])]) ] };
  }
  if (path.startsWith('/blogs/')) {
    const { data: blog, error } = await supabase.from('blogs').select('*').eq('slug', decodeURIComponent(path.slice(7))).eq('is_published', true).maybeSingle();
    if (error) throw error;
    if (!blog) return notFound(canonical);
    return { ...base, title: blog.meta_title || blog.title, description: blog.meta_description || blog.excerpt, image: blog.cover_image, type: 'article', jsonLd: [...base.jsonLd, articleSchema(blog), breadcrumbData([{ label: 'Blog', to: '/blogs' }, { label: blog.title, to: canonical }])] };
  }
  if (path === '/blogs' && url.searchParams.has('category')) {
    const { data: category, error } = await supabase.from('blog_categories').select('name,slug').eq('slug', url.searchParams.get('category')).maybeSingle();
    if (error) throw error;
    if (!category) return notFound(canonical);
    return { ...base, title: `${category.name} Guides & Advice${Number(url.searchParams.get('page')) > 1 ? ` – Page ${Number(url.searchParams.get('page'))}` : ''}`, description: `Read ${category.name.toLowerCase()} guides and advice from ElectroGhar. Pakistan-focused tips for buying, fixing and selling tech.`, noIndex: url.searchParams.has('search') };
  }
  if (STATIC_PAGES[path]) return { ...base, ...STATIC_PAGES[path], ...(path === "/blogs" && Number(url.searchParams.get("page")) > 1 ? { title: `${STATIC_PAGES[path].title} – Page ${Number(url.searchParams.get("page"))}` } : {}), noIndex: path === '/blogs' && url.searchParams.has('search'), jsonLd: [...base.jsonLd, ...(path === '/faqs' || path === '/' ? [faqSchema()] : []), ...(path === '/' ? [{ '@type': 'WebSite', name: 'ElectroGhar', url: absoluteUrl('/') }] : [{ '@type': 'WebPage', name: STATIC_PAGES[path].title, url: canonical }])] };
  return notFound(canonical);
}
function notFound(canonical) { return { title: 'Page Not Found', description: 'This page is unavailable. Browse ElectroGhar products or contact our Karachi store.', canonical, status: 404, noIndex: true }; }

export function renderHead(html, meta) {
  // Remove only tags owned by the SEO manager. Preserve assets, fonts and viewport.
  html = html.replace(/<title>[^]*?<\/title>/gi, '').replace(/<meta\s+[^>]*(?:name=["'](?:description|robots|twitter:[^"']+|google-site-verification|msvalidate\.01)["']|property=["']og:[^"']+["'])[^>]*>/gi, '').replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, '').replace(/<script\s+[^>]*id=["']structured-data["'][^>]*>[^]*?<\/script>/gi, '');
  const title = `${meta.title || 'ElectroGhar'} | ElectroGhar`;
  const image = absoluteUrl(meta.image || '/logo-full.png');
  const tags = [
    `<title>${escapeXml(title)}</title>`, `<link rel="canonical" href="${escapeXml(meta.canonical)}">`,
    ...Object.entries({ description: meta.description || '', robots: meta.noIndex ? 'noindex, follow' : 'index, follow, max-image-preview:large', 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': meta.description || '', 'twitter:image': image, 'twitter:url': meta.canonical, ...((process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION) ? { 'google-site-verification': (process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION) } : {}), ...((process.env.BING_SITE_VERIFICATION || process.env.VITE_BING_SITE_VERIFICATION) ? { 'msvalidate.01': (process.env.BING_SITE_VERIFICATION || process.env.VITE_BING_SITE_VERIFICATION) } : {}) }).map(([name, content]) => `<meta name="${name}" content="${escapeXml(content)}">`),
    ...Object.entries({ 'og:type': meta.type || 'website', 'og:title': title, 'og:description': meta.description || '', 'og:url': meta.canonical, 'og:image': image, 'og:image:alt': meta.title || 'ElectroGhar', 'og:site_name': 'ElectroGhar', 'og:locale': 'en_PK' }).map(([property, content]) => `<meta property="${property}" content="${escapeXml(content)}">`),
    `<script id="structured-data" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd || [] }).replace(/</g, '\\u003c')}</script>`,
  ];
  return html.replace('</head>', `${tags.join('\n')}\n</head>`);
}
