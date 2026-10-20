import { Router } from 'express';
import { SITE_URL } from '../../../client/src/utils/seoData.mjs';
import { sitemapEntries, sitemapXml } from '../services/seo.js';
export const seoRoutes = Router();
seoRoutes.get('/robots.txt', (_req, res) => {
  res.type('text/plain').set('Cache-Control', 'public, max-age=3600').send(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});
seoRoutes.get('/sitemap.xml', async (_req, res, next) => {
  try {
    res.type('application/xml').set('Cache-Control', 'public, max-age=300, s-maxage=300').send(sitemapXml(await sitemapEntries()));
  } catch (error) {
    // Never advertise an incomplete successful sitemap when the database fails.
    res.set('Cache-Control', 'no-store');
    error.status = 503;
    next(error);
  }
});
