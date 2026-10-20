import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
const { supabase } = await import('../src/config/supabase.js');
const { canonicalUrl, productSchema, productMetadata, organizationSchema, STATIC_PAGES, SITE_URL, faqEntries } = await import('../../client/src/utils/seoData.mjs');
const { allRows, sitemapEntries, sitemapXml, pageMetadata, renderHead } = await import('../src/services/seo.js');
const { seoRoutes } = await import('../src/routes/seo.js');
const { pageRoutes } = await import('../src/routes/pages.js');
const working = { id: 'p1', slug: 'dell-latitude', name: 'Dell Latitude', category: 'laptops', brand: 'Dell', price: 45000, currency: 'PKR', condition_type: 'used', is_available: true, stock_qty: 2, specs: { ram: '8GB', storage: '256GB SSD' }, updated_at: '2026-10-01' };
const fixture = {
  categories: [{ id: 'c1', slug: 'laptops', name: 'Laptops', parent_id: null, is_active: true }, { id: 'c3', slug: 'empty-category', name: 'Empty', parent_id: null, is_active: true }, { id: 'c2', slug: 'orphan-category', name: 'Hidden', parent_id: 'inactive-parent', is_active: true }],
  products: [working, { ...working, id: 'p2', slug: 'hidden', category: 'orphan-category' }],
  blogs: [{ id: 'b1', slug: 'laptop-guide', title: 'Laptop Guide', excerpt: 'Compare laptops.', is_published: true, updated_at: '2026-09-30' }],
};
function mockDatabase(data = fixture, fail = false) {
  const ranges = [];
  supabase.from = table => {
    let rows = [...(data[table] || [])];
    let single = false;
    const q = {
      select() { return q; }, order() { return q; }, limit(n) { rows = rows.slice(0, n); return q; }, in(key, values) { rows = rows.filter(row => values.includes(row[key])); return q; },
      eq(key, value) { rows = rows.filter(row => key === 'is_active' ? row[key] !== false : row[key] === value); return q; },
      range(start, end) { ranges.push([table, start, end]); rows = rows.slice(start, end + 1); return q; },
      maybeSingle() { single = true; return q; },
      then(resolve, reject) { return Promise.resolve({ data: fail ? null : single ? rows[0] || null : rows, error: fail ? new Error('Database offline') : null }).then(resolve, reject); },
    };
    return q;
  };
  return ranges;
}
function response() {
  return { statusCode: 200, headers: {}, status(value) { this.statusCode = value; return this; }, set(key, value) { this.headers[key] = value; return this; }, type(value) { this.headers['Content-Type'] = value; return this; }, send(body) { this.body = body; return this; }, redirect(code, loc) { this.statusCode = code; this.headers.Location = loc; return this; } };
}
async function route(router, path, req) {
  const handler = router.stack.find(layer => layer.route?.path === path).route.stack[0].handle;
  const res = response();
  await handler(req, res, error => { if (error) res.error = error; });
  return res;
}
test('canonical URLs use the public origin, normalize facets and retain pagination', () => {
  assert.equal(canonicalUrl('https://preview.example/products?utm_source=a&page=2&brand=Dell&category=laptops&sort=price.asc#top'), `${SITE_URL}/products?category=laptops&brand=Dell&page=2`);
  assert.equal(canonicalUrl('/products/?page=1'), `${SITE_URL}/products`);
  assert.equal(canonicalUrl('/blogs?page=3&search=hp'), `${SITE_URL}/blogs?page=3`);
  assert.equal(canonicalUrl('/product/dell-latitude?tracking=1'), `${SITE_URL}/product/dell-latitude`);
});
test('product markup contains real price, specs, condition and checking warranty', () => {
  const schema = productSchema(working);
  assert.equal(schema.offers.price, '45000');
  assert.equal(schema.offers.availability, 'https://schema.org/InStock');
  assert.equal(schema.offers.warranty.durationOfWarranty.value, 30);
  assert.equal(schema.additionalProperty[0].value, '8GB');
  assert.equal(schema.aggregateRating, undefined);
  assert.equal(schema.review, undefined);
});
test('unknown prices, brands and stock are not fabricated', () => {
  for (const price of [null, undefined, '', 0, 'unknown', -1]) assert.equal(productSchema({ ...working, price }).offers, undefined);
  const schema = productSchema({ ...working, brand: null, stock_qty: null });
  assert.equal(schema.brand, undefined);
  assert.equal(schema.offers.availability, undefined);
  assert.equal(productSchema({ ...working, condition_type: 'refurbished' }).offers.itemCondition, 'https://schema.org/RefurbishedCondition');
});
test('dead laptops never advertise a checking warranty in markup or metadata', () => {
  for (const description of ['Dead laptop', 'faulty', 'non-working', 'for parts only']) {
    const product = { ...working, description };
    assert.equal(productSchema(product).offers.warranty, undefined);
    assert.match(productMetadata({ ...product, meta_description: 'Free 1-year warranty' }).description, /AS IS, no checking warranty/);
    assert.match(productMetadata(product).description, /AS IS, no checking warranty/);
  }
  assert.equal(productSchema({ ...working, category: 'laptop-accessories' }).offers.warranty, undefined);
});
test('local business markup matches the supplied NAP and opening hours', () => {
  const schema = organizationSchema();
  assert.equal(schema.telephone, '+923319244435');
  assert.equal(schema.address.streetAddress, 'Shop G-97, Gate #11, Naaz Digital Plaza, M.A. Jinnah Road');
  assert.equal(schema.address.addressLocality, 'Karachi');
  assert.equal(schema.openingHoursSpecification[0].opens, '12:00');
  assert.equal(schema.openingHoursSpecification[0].closes, '23:00');
  assert.equal(schema.openingHoursSpecification[0].dayOfWeek.length, 6);
});
test('catalog enumeration pages past Supabase default row limits', async () => {
  const ranges = mockDatabase({ products: Array.from({ length: 1005 }, (_, id) => ({ id })) });
  assert.equal((await allRows('products', 'id')).length, 1005);
  assert.deepEqual(ranges, [['products', 0, 999], ['products', 1000, 1999]]);
});
test('sitemap includes policies, live products, categories, brands and published blogs, excluding hidden categories', async () => {
  mockDatabase();
  const entries = await sitemapEntries();
  assert(entries.some(e => e.loc.endsWith('/warranty-policy')));
  assert(entries.some(e => e.loc.endsWith('/product/dell-latitude')));
  assert(entries.some(e => e.loc.endsWith('/products?brand=Dell')));
  assert(entries.some(e => e.loc.endsWith('/blogs/laptop-guide')));
  assert(!entries.some(e => /hidden|orphan|admin|empty-category/.test(e.loc)));
  const xml = sitemapXml(entries);
  assert.match(xml, /<lastmod>2026-10-01T00:00:00.000Z<\/lastmod>/);
  assert(!xml.includes('undefined'));
  assert(!xml.match(/<loc>https:\/\/electroghar.pk\/<\/loc><lastmod>/));
});
test('XML escapes query strings and invalid dates are omitted', () => {
  const xml = sitemapXml([{ loc: `${SITE_URL}/products?category=laptops&brand=Dell`, updated_at: 'bad' }]);
  assert.match(xml, /&amp;brand=Dell/);
  assert(!xml.includes('<lastmod>'));
});
test('robots uses the configured public origin and allows fetching noindex pages', async () => {
  const res = await route(seoRoutes, '/robots.txt', { protocol: 'http', get: () => 'attacker.example' });
  assert.match(res.body, new RegExp(`Sitemap: ${SITE_URL}/sitemap.xml`));
  assert(!res.body.includes('attacker.example'));
  assert(!res.body.includes('Disallow: /admin'));
});
test('sitemap database errors cannot silently produce an incomplete 200 response', async () => {
  mockDatabase(fixture, true);
  const res = await route(seoRoutes, '/sitemap.xml', {});
  assert.equal(res.error.status, 503);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('all static routes provide unique titles and complete metadata', async () => {
  const titles = new Set();
  for (const [path] of Object.entries(STATIC_PAGES)) {
    const meta = await pageMetadata(path);
    assert(meta.title && meta.description);
    assert.equal(meta.status, 200);
    assert(!titles.has(meta.title));
    titles.add(meta.title);
    assert.equal(meta.canonical, `${SITE_URL}${path}`);
  }
});
test('product and brand HTML metadata is dynamic; missing products return 404', async () => {
  mockDatabase();
  const product = await pageMetadata('/product/dell-latitude');
  assert.match(product.title, /Dell Latitude/);
  assert(product.jsonLd.some(node => node['@type'] === 'Product'));
  assert.equal((await pageMetadata('/product/missing')).status, 404);
  assert.equal((await pageMetadata('/product/hidden')).status, 404);
  const brand = await pageMetadata('/products?brand=Dell&page=2');
  assert.match(brand.title, /Dell.*Page 2/);
  assert.equal(brand.noIndex, false);
  assert.equal((await pageMetadata('/products?search=dell')).noIndex, true);
  assert.equal((await pageMetadata('/admin/login')).noIndex, true);
});
test('head rendering replaces old tags, escapes untrusted metadata and retains assets', () => {
  const template = '<html><head><title>Old</title><meta name="description" content="old"><link rel="canonical" href="old"><meta property="og:title" content="old"><script id="structured-data" type="application/ld+json">{}</script><script src="/assets/app.js" type="module"></script></head></html>';
  const html = renderHead(template, { title: '<Phone> "Special"', description: 'A & B', canonical: `${SITE_URL}/products`, jsonLd: [{ name: '</script><script>bad()</script>' }] });
  assert.equal((html.match(/<title>/g) || []).length, 1);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((html.match(/id="structured-data"/g) || []).length, 1);
  assert(html.includes('/assets/app.js'));
  assert(html.includes('&lt;Phone&gt;'));
  assert(!html.includes('<script>bad()'));
  const payload = JSON.parse(html.match(/id="structured-data"[^>]*>(.*?)<\/script>/s)[1]);
  assert.equal(payload['@graph'][0].name, '</script><script>bad()</script>');
});
test('HTML handler serves metadata, redirects trailing slashes and sends actual 404 status', async () => {
  mockDatabase();
  const product = await route(pageRoutes, '*', { path: '/product/dell-latitude', originalUrl: '/product/dell-latitude' });
  assert.equal(product.statusCode, 200);
  assert.match(product.body, /Dell Latitude/);
  const missing = await route(pageRoutes, '*', { path: '/missing', originalUrl: '/missing' });
  assert.equal(missing.statusCode, 404);
  assert.equal(missing.headers['X-Robots-Tag'], 'noindex, follow');
  const redirected = await route(pageRoutes, '*', { path: '/products/', url: '/products/?page=2' });
  assert.equal(redirected.statusCode, 301);
  assert.equal(redirected.headers.Location, '/products?page=2');
});
test('built homepage includes canonical, social cards, schema, assets and visible-policy FAQ source', async () => {
  const html = await readFile(new URL('../../client/dist/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card"/);
  assert(faqEntries.length >= 5);
  for (const asset of ['/logo.png', '/logo-full.png']) await readFile(new URL(`../../client/dist${asset}`, import.meta.url));
});

test('SPA head manager creates correctly named canonical and social tags without duplicates', async () => {
  const source = await readFile(new URL('../../client/src/utils/seo.js', import.meta.url), 'utf8');
  const code = source.slice(source.indexOf('function updateOrCreateMeta'), source.indexOf('/**'));
  const nodes = [];
  const document = {
    head: { appendChild(node) { nodes.push(node); } },
    createElement(tag) { return { tag, attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } }; },
    querySelector(selector) { const [, tag, attr, value] = selector.match(/^(\w+)\[([^=]+)="([^"]+)"\]$/); return nodes.find(node => node.tag === tag && node.attrs[attr] === value); },
  };
  const update = new Function('document', `${code}; return updateOrCreateMeta;`)(document);
  update('link[rel="canonical"]', 'rel', `${SITE_URL}/products`, 'link');
  update('link[rel="canonical"]', 'rel', `${SITE_URL}/products?page=2`, 'link');
  update('meta[property="og:url"]', 'property', `${SITE_URL}/products?page=2`);
  update('meta[name="robots"]', 'name', 'noindex, follow');
  assert.equal(nodes.length, 3);
  assert.equal(nodes[0].attrs.rel, 'canonical');
  assert.equal(nodes[0].attrs.href, `${SITE_URL}/products?page=2`);
  assert.equal(nodes[1].attrs.property, 'og:url');
  assert.equal(nodes[2].attrs.name, 'robots');
});
