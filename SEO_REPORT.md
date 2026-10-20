# ElectroGhar SEO implementation

Implemented locally on October 20, 2026. These changes have not been deployed or submitted to search engines.

## Completed

- Shared dynamic product, category and brand metadata; stable production canonicals; Open Graph and Twitter cards; canonical normalization removes tracking and sorting duplicates while retaining pagination. Existing product slugs and catalog data are preserved.
- Initial HTML metadata and JSON-LD for public routes through the existing Express/Vercel function, alongside SPA metadata updates. Fixed the existing head manager's incorrect attributes when creating canonical/social tags.
- Product schema uses real prices, conditions, stock and specifications. Missing prices produce no Offer; ratings and reviews are never invented. Eligible laptops show a 30-day checking warranty; dead/faulty/parts laptops do not advertise that warranty in generated metadata or schema.
- Organization/ElectronicsStore (a LocalBusiness subtype), Product, BreadcrumbList, WebSite, CollectionPage, BlogPosting and policy-based FAQPage markup. Business address, phone and Monday–Saturday 12:00–23:00 hours share the existing contact source. FAQs are visible and use the same policy text as their schema.
- Dynamic `/sitemap.xml` includes public products, published articles, visible categories, brands and policy pages. Database reads paginate past the default row limit. Hidden categories and their products, plus empty categories, are excluded; timestamps use actual content updates; failures return an error rather than a partial successful sitemap. `/robots.txt` points to the canonical sitemap. Admin URLs receive noindex while remaining fetchable so crawlers can see that directive.
- Real HTTP 404 responses for unavailable product/article routes and unknown pages, trailing-slash redirects, with domain canonicalization managed by the existing Vercel Domains configuration. Missing asset URLs do not receive a successful SPA document.
- Crawlable pagination links; category/brand introductory copy; category breadcrumbs; improved product image alt text and dimensions; relevant homepage content and policy FAQs; Maps embed and directions link on Contact.
- Bundled hero image reduced from 1,648,471 to 78,976 bytes (about 95%); fallback product image from 1,484,222 to 71,690 bytes. Existing image composition and layout are retained. Main JS reduced from about 457 KB to about 387 KB by loading admin pages separately. Product listings retain lazy loading; the hero and primary product image have high fetch priority. Hashed assets receive immutable caching.

## Validation

- `npm run test:seo`: production build plus 18 SEO checks, passing. Covers canonical normalization, real product data, warranty exclusions, NAP, sitemap pagination/visibility/XML escaping, robots, error handling, unique static metadata, HTML escaping, initial HTML, 404s/redirects and SPA meta-tag creation.
- `npm test --prefix server`: all 25 existing regression tests passed.
- `npm run lint --prefix client`: zero errors; existing warnings remain.
- These checks use controlled catalog fixtures. They do not certify the contents of the production database, external image URLs, every live link, Google rich-result eligibility, or deployed routing.
- Browser surfaces were unavailable in this session. Mobile visual QA, Lighthouse/PageSpeed and field Core Web Vitals were not measured. The site body remains a React SPA; initial head metadata is server generated, while product content still requires JavaScript rendering. Full body SSR is a possible future architecture improvement.

## Deployment and account steps

1. Deploy the updated repository to the existing Vercel site. The function must include `client/dist/index.html`; `vercel.json` now declares this. Keep existing Supabase configuration. The separate Render API service continues to work without a client build; it is not the public HTML host.
2. The default canonical origin is `https://www.electroghar.pk`. If it changes, set matching `SITE_URL` (server) and `VITE_SITE_URL` (client build), update the primary domain in Vercel Domains and rebuild. Confirm both domains have valid DNS/TLS. The live platform redirects apex to www; do not add an opposing www-to-apex application redirect.
3. In Google Search Console and Bing Webmaster Tools, obtain the site's real verification tokens. Set `VITE_GOOGLE_SITE_VERIFICATION` and `VITE_BING_SITE_VERIFICATION` before rebuilding. These variables are also accepted by the HTML function; alternatively use `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` at runtime. DNS verification is also possible through the account/domain owner. No fabricated tokens are included.
4. After deployment, verify the properties and submit `https://www.electroghar.pk/sitemap.xml` in both accounts. Check robots, a working product, a dead laptop, a brand/category, page two, an unknown URL and www redirects on the deployed site. Use Search Console URL Inspection and Google's Rich Results Test for representative URLs.
5. Verify/update the Google Business Profile with the supplied NAP and operating hours. A precise Place ID/maps listing can replace the address search URL once confirmed; no coordinates or ratings have been guessed.
6. Run PageSpeed Insights on real mobile pages and monitor Search Console Core Web Vitals, indexing and product reports. Optimize uploaded catalog/hero images at their source as needed; only bundled images were recompressed here. Review weak/missing or outdated custom catalog descriptions and SEO overrides using actual product facts.

## Reference guidance

Implementation follows [Google ecommerce guidance](https://developers.google.com/search/docs/specialty/ecommerce), [JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), and [pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading). FAQ markup describes the visible business policy; it is not a promise of a Google FAQ rich result. Rankings and indexing must be evaluated after deployment and recrawling.
