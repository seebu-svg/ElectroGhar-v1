import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { pageMetadata, renderHead } from '../services/seo.js';
export const pageRoutes = Router();
const templatePath = new URL('../../../client/dist/index.html', import.meta.url);
pageRoutes.get('*', async (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || (!req.path.startsWith('/product/') && !req.path.startsWith('/blogs/') && /\.[a-z0-9]+$/i.test(req.path))) return next();
  try {
    const template = await readFile(templatePath, 'utf8');
    if (req.path.length > 1 && req.path.endsWith('/')) return res.redirect(301, req.path.replace(/\/+$/, '') + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
    if (req.path === "/faq") return res.redirect(301, "/faqs");
    const meta = await pageMetadata(req.originalUrl);
    res.set('X-Robots-Tag', meta.noIndex ? 'noindex, follow' : 'index, follow');
    res.set('Cache-Control', req.path.startsWith('/admin') ? 'no-store' : 'public, max-age=0, s-maxage=60');
    res.status(meta.status).type('html').send(renderHead(template, meta));
  } catch (error) {
    if (error.code === 'ENOENT') return next(); // API-only Render service has no client build.
    res.set('Cache-Control', 'no-store');
    error.status = 503;
    next(error);
  }
});
