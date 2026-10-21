# Branding consistency fix

## Cause

`SiteLogo` initially rendered a component-specific orange bundled logo, then
replaced it after `/api/logo` returned. Each instance fetched independently and
refetched on window focus. The public SEO logos differed from the source copies.
Favicon URLs reused a fixed `eg-2026` query, so those URLs did not change with asset
contents. No service worker, favicon-changing script, or PWA manifest existed.

## Approved artwork

The live `/api/logo` response on 2026-10-21 identified the uploaded red-and-white
EG logo with revision `2026-10-20T12:08:08.579Z`. The exact downloaded PNG is
`client/public/branding/logo-b255f7efa056.png`. Existing favicon artwork was
preserved byte-for-byte. No artwork was regenerated and no colors were changed.

`client/src/utils/branding.mjs` defines the content-versioned URLs. All logo
components share one store and one initial lookup. Until that lookup and image
preload finish, the logo space is reserved without showing another logo. Other
page content loads normally. An API failure uses the approved bundled snapshot;
a broken replacement retains the last working logo. Admin replacements still
update all mounted instances. Page focus no longer changes the logo.

Legacy public logo URLs contain the approved snapshot for compatibility with old
links. The obsolete source logos were removed. SEO and structured data use the
versioned approved URL. Initial HTML references versioned PNG, ICO, SVG, and Apple
icons, and the new manifest references the same icons.

## Cache behavior

Vercel caches content-versioned branding assets immutably. Legacy logo/icon URLs
and the manifest revalidate. `/api/logo` already uses `no-store`; logo uploads now
set storage cache duration to zero, while ordinary uploads retain normal caching.
Existing cached files may remain in a browser, but the new HTML requests new URLs.
No global cache disabling or unrelated storage clearing was introduced.

## Verification

Passed with Node 24: production build; branding regression tests; admin tests;
SEO tests. Client lint exits successfully with existing unrelated warnings.
The branding tests cover delayed/shared resolution, offline lookup, failed
replacement, content hashes, and initial HTML/manifest icon references.

After deployment, verify desktop and mobile, private browsing, direct nested
routes, normal and hard refresh, and a returning profile that visited the previous
deployment. These browser/cache scenarios were not executed in this workspace.
A pending lookup intentionally reserves logo space; it never shows the orange
logo. No deployment was performed as part of this source change.

## Files changed for this fix

- `client/index.html`, `client/vite.config.js`
- `client/src/components/ui/SiteLogo.jsx`
- `client/src/components/layout/{Navbar,Footer}.jsx`
- `client/src/components/admin/{AdminLayout,LogoSettings}.jsx`
- `client/src/pages/admin/LoginPage.jsx`
- `client/src/utils/{branding,siteLogo,seoData}.mjs`, `client/src/utils/seo.js`
- `client/public/branding/*`, `client/public/site.webmanifest`
- `client/public/{logo,logo-full}.png` (compatibility assets replaced)
- `client/src/assets/{logo,logo-full}.png` (obsolete assets removed)
- `server/src/services/seo.js`, `server/src/routes/upload.js`
- `vercel.json`, `client/test/branding.test.mjs`, this document

Other pre-existing workspace changes were preserved.
