import { BRANDING } from './branding.mjs';
import { BRAND_TAGLINE } from "./brand.mjs";
import { SITE_URL, absoluteUrl, canonicalUrl, DEFAULT_DESCRIPTION, organizationSchema, productSchema, articleSchema } from "./seoData.mjs";
export { organizationSchema, productSchema };
import { CONTACT } from "./contact";
import { useEffect } from "react";

export const SITE = {
  name: "ElectroGhar",
  tagline: BRAND_TAGLINE,
  defaultDescription: DEFAULT_DESCRIPTION,
  phone: CONTACT.internationalPhone,
  address: {
    street: CONTACT.street,
    city: CONTACT.city,
    region: CONTACT.region,
    country: "PK",
  },
  social: {
    whatsapp: CONTACT.whatsappUrl,
    website: SITE_URL,
  },
};

function baseUrl() { return SITE_URL; }
function absoluteImage(path) { return absoluteUrl(path || BRANDING.logo); }

function updateOrCreateMeta(selector, key, value, tag = "meta") {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    const attributeValue = selector.match(/\[[^=\]]+=["']([^"']+)["']\]/)?.[1];
    el.setAttribute(key, attributeValue);
    document.head.appendChild(el);
  }
  if (tag === "link") {
    el.setAttribute("href", value || "");
  } else {
    el.setAttribute("content", value || "");
  }
}

/**
 * Drop-in SEO head manager for Vite SPAs.
 * Updates <title>, description, canonical, Open Graph and Twitter tags.
 * Accepts a single JSON-LD object or an array (wrapped in @graph).
 */
export function SEOHead({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  noIndex = false,
}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE.name}`
      : `${SITE.name} , ${SITE.tagline}`;
    document.title = fullTitle;

    const url = canonicalUrl(canonical || (typeof window !== "undefined" ? window.location.href : baseUrl()));
    const ogImage = absoluteImage(image);

    updateOrCreateMeta('meta[name="description"]', "name", description || SITE.defaultDescription);
    updateOrCreateMeta('link[rel="canonical"]', "rel", url, "link");

    updateOrCreateMeta('meta[property="og:url"]', "property", url);
    updateOrCreateMeta('meta[property="og:type"]', "property", type === "product" ? "website" : type);
    updateOrCreateMeta('meta[property="og:title"]', "property", title || SITE.name);
    updateOrCreateMeta('meta[property="og:description"]', "property", description || SITE.defaultDescription);
    updateOrCreateMeta('meta[property="og:site_name"]', "property", SITE.name);
    updateOrCreateMeta('meta[property="og:image"]', "property", ogImage);
    updateOrCreateMeta('meta[property="og:locale"]', "property", "en_PK");

    updateOrCreateMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    updateOrCreateMeta('meta[name="twitter:title"]', "name", title || SITE.name);
    updateOrCreateMeta('meta[name="twitter:description"]', "name", description || SITE.defaultDescription);
    updateOrCreateMeta('meta[name="twitter:image"]', "name", ogImage);

    updateOrCreateMeta('meta[name="robots"]', "name", noIndex ? "noindex, follow" : "index, follow, max-image-preview:large");

    const google = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION;
    const bing = import.meta.env.VITE_BING_SITE_VERIFICATION;
    if (google) updateOrCreateMeta('meta[name="google-site-verification"]', 'name', google);
    if (bing) updateOrCreateMeta('meta[name="msvalidate.01"]', 'name', bing);
    updateOrCreateMeta('meta[name="twitter:url"]', 'name', url);
    updateOrCreateMeta('meta[property="og:image:alt"]', 'property', title || SITE.name);
    // JSON-LD structured data
    const existing = document.getElementById("structured-data");
    {
      const graph = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
      const payload = { "@context": "https://schema.org", "@graph": [organizationSchema(), ...graph.filter(node => node?.["@id"] !== absoluteUrl("/#business"))] };
      if (existing) {
        existing.textContent = JSON.stringify(payload);
      } else {
        const script = document.createElement("script");
        script.id = "structured-data";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(payload);
        document.head.appendChild(script);
      }
    }

    return () => {
      // Reset title only on unmount; page transitions set it again immediately.
      document.title = `${SITE.name} , ${SITE.tagline}`;
      const script = document.getElementById("structured-data");
      if (script) script.remove();
    };
  }, [title, description, canonical, image, type, jsonLd, noIndex]);

  return null;
}

/** Build a WebSite structured data object. */
export function websiteSchema(searchUrl = `${baseUrl()}/products`) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: baseUrl(),
    description: SITE.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${searchUrl}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Build a BreadcrumbList schema from [{label, to}]. */
export function breadcrumbSchema(items) {
  const trail = items[0]?.label === "Home" ? items : [{ label: "Home", to: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: absoluteUrl(item.to || "/"),
    })),
  };
}

/** Build a BlogPosting schema. */
export function blogPostingSchema(blog, categories = []) {
  const cat = categories.find(c => c.slug === blog.category);
  return { ...articleSchema(blog), articleSection: cat?.name || blog.category };
}

/** Build an ItemList schema for paginated product lists. */
export function itemListSchema(products, listUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: listUrl,
    itemListElement: products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${baseUrl()}/product/${p.slug}`,
      name: p.name,
    })),
  };
}
