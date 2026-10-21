import { BRANDING } from './src/utils/branding.mjs';
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import { SITE_URL, HOME_TITLE, DEFAULT_DESCRIPTION, organizationSchema, faqSchema } from "./src/utils/seoData.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const origin = (env.VITE_SITE_URL || SITE_URL).replace(/\/$/, '');
  return {
    plugins: [react(), tailwindcss(), {
      name: 'electroghar-seo',
      transformIndexHtml(html) {
        html = html.replace(/<title>[^]*?<\/title>/, `<title>${HOME_TITLE} | ElectroGhar</title>`)
          .replace(/<meta (?:name="(?:description|twitter:[^"]+)"|property="og:[^"]+")[^>]*>/g, '')
          .replace(/<script id="structured-data"[^>]*>[^]*?<\/script>/, '');
        const tags = [
          { tag: 'link', attrs: { rel: 'canonical', href: `${origin}/` } },
          ...Object.entries({ description: DEFAULT_DESCRIPTION, robots: 'index, follow, max-image-preview:large', 'twitter:card': 'summary_large_image', 'twitter:title': HOME_TITLE, 'twitter:description': DEFAULT_DESCRIPTION, 'twitter:image': `${origin}${BRANDING.logo}`, 'twitter:url': `${origin}/`, ...(env.VITE_GOOGLE_SITE_VERIFICATION ? { 'google-site-verification': env.VITE_GOOGLE_SITE_VERIFICATION } : {}), ...(env.VITE_BING_SITE_VERIFICATION ? { 'msvalidate.01': env.VITE_BING_SITE_VERIFICATION } : {}) }).map(([name, content]) => ({ tag: 'meta', attrs: { name, content } })),
          ...Object.entries({ 'og:type': 'website', 'og:title': HOME_TITLE, 'og:description': DEFAULT_DESCRIPTION, 'og:site_name': 'ElectroGhar', 'og:locale': 'en_PK', 'og:url': `${origin}/`, 'og:image': `${origin}${BRANDING.logo}` }).map(([property, content]) => ({ tag: 'meta', attrs: { property, content } })),
          { tag: 'script', attrs: { id: 'structured-data', type: 'application/ld+json' }, children: JSON.stringify({ '@context': 'https://schema.org', '@graph': [organizationSchema(), faqSchema(), { '@type': 'WebSite', name: 'ElectroGhar', url: `${origin}/` }] }).replace(/</g, '\\u003c') },
        ];
        // Attributes are escaped by Vite's HTML serializer.
        return { html, tags };
      },
    }],
    server: { port: 5173, proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true }, '/sitemap.xml': 'http://localhost:5000', '/robots.txt': 'http://localhost:5000' } },
  };
});
