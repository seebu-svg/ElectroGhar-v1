import { useEffect } from "react";

export const SITE = {
  name: "ElectroGhar",
  tagline: "Good Tech. Better Deals.",
  defaultDescription:
    "Pakistan's trusted marketplace for quality checked laptops, PCs, monitors, storage and gadgets — new, used and refurbished. Message us on WhatsApp for the latest price.",
  phone: "+92 300 1234567",
  address: {
    street: "",
    city: "Lahore",
    region: "Punjab",
    country: "PK",
  },
  social: {
    whatsapp: "https://wa.me/923001234567",
  },
};

function baseUrl() {
  if (typeof window === "undefined") return "https://electroghar.pk";
  return window.location.origin;
}

function absoluteImage(path) {
  if (!path) return `${baseUrl()}/logo-full.png`;
  if (path.startsWith("http")) return path;
  return `${baseUrl()}${path}`;
}

function updateOrCreateMeta(selector, key, value, tag = "meta") {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(key, selector.match(/\[([^=\]]+)=/)[1]);
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
      : `${SITE.name} — ${SITE.tagline}`;
    document.title = fullTitle;

    const url = canonical || (typeof window !== "undefined" ? window.location.href : baseUrl());
    const ogImage = absoluteImage(image);

    updateOrCreateMeta('meta[name="description"]', "name", description || SITE.defaultDescription);
    updateOrCreateMeta('link[rel="canonical"]', "rel", url, "link");

    updateOrCreateMeta('meta[property="og:url"]', "property", url);
    updateOrCreateMeta('meta[property="og:type"]', "property", type);
    updateOrCreateMeta('meta[property="og:title"]', "property", title || SITE.name);
    updateOrCreateMeta('meta[property="og:description"]', "property", description || SITE.defaultDescription);
    updateOrCreateMeta('meta[property="og:site_name"]', "property", SITE.name);
    updateOrCreateMeta('meta[property="og:image"]', "property", ogImage);
    updateOrCreateMeta('meta[property="og:locale"]', "property", "en_PK");

    updateOrCreateMeta('meta[name="twitter:card"]', "name", "summary_large_image");
    updateOrCreateMeta('meta[name="twitter:title"]', "name", title || SITE.name);
    updateOrCreateMeta('meta[name="twitter:description"]', "name", description || SITE.defaultDescription);
    updateOrCreateMeta('meta[name="twitter:image"]', "name", ogImage);

    updateOrCreateMeta('meta[name="robots"]', "name", noIndex ? "noindex, nofollow" : "index, follow");

    // JSON-LD structured data
    const existing = document.getElementById("structured-data");
    if (jsonLd) {
      const payload = Array.isArray(jsonLd) ? { "@context": "https://schema.org", "@graph": jsonLd } : jsonLd;
      if (existing) {
        existing.textContent = JSON.stringify(payload);
      } else {
        const script = document.createElement("script");
        script.id = "structured-data";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify(payload);
        document.head.appendChild(script);
      }
    } else if (existing) {
      existing.remove();
    }

    return () => {
      // Reset title only on unmount; page transitions set it again immediately.
      document.title = `${SITE.name} — ${SITE.tagline}`;
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

/** Build an Organization / LocalBusiness schema. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: baseUrl(),
    logo: `${baseUrl()}/logo.png`,
    description: SITE.defaultDescription,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "Customer Service",
      availableLanguage: ["English", "Urdu"],
    },
    sameAs: [SITE.social.whatsapp],
  };
}

/** Build a Product schema. */
export function productSchema(product) {
  const url = `${baseUrl()}/product/${product.slug}`;
  const image = absoluteImage(product.thumbnail_url || (Array.isArray(product.images) ? product.images[0] : "/product-placeholder.png"));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image,
    description: product.meta_description || product.description || `${product.name} — ${product.condition_grade} condition`,
    sku: product.sku || product.slug,
    brand: {
      "@type": "Brand",
      name: product.brand || "ElectroGhar",
    },
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PKR",
      price: String(product.price || 0),
      availability: product.is_available && product.stock_qty > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: product.condition_type === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization",
        name: SITE.name,
      },
    },
  };
}

/** Build a BreadcrumbList schema from [{label, to}]. */
export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: item.to,
    })),
  };
}

/** Build a BlogPosting schema. */
export function blogPostingSchema(blog, categories = []) {
  const cat = categories.find((c) => c.slug === blog.category);
  const url = `${baseUrl()}/blogs/${blog.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: absoluteImage(blog.cover_image),
    url,
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.published_at || blog.created_at,
    author: {
      "@type": "Person",
      name: blog.author || SITE.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: `${baseUrl()}/logo.png`,
    },
    articleSection: cat?.name || blog.category,
    keywords: Array.isArray(blog.tags) ? blog.tags.join(", ") : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
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
