import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAdmin } from '../middleware/auth.js';
export const catalogAdminRoutes = Router();
catalogAdminRoutes.use(requireAdmin);
catalogAdminRoutes.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const run = fn => async (req, res, next) => { try { await fn(req, res); } catch (e) { next(e); } };
const fail = message => Object.assign(new Error(message), { status: 400 });
async function categoryBody(body, id) {
  const name = String(body.name || '').trim();
  if (!name || name.length > 100) throw fail('Category name is required (max 100 characters)');
  const { data, error } = await supabase.from('categories').select('id,slug,parent_id');
  if (error) throw error;
  const parent = data.find(c => c.id === body.parent_id);
  if (body.parent_id && (!parent || parent.parent_id || parent.id === id || data.some(c => c.parent_id === id))) throw fail('Choose a main category as parent; only two levels are supported');
  const current = data.find(c => c.id === id);
  const generated = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const slug = current?.slug || String(body.slug || (parent ? `${parent.slug}-${generated}` : generated));
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw fail('Use a unique URL slug containing letters, numbers and hyphens');
  if (!Number.isInteger(Number(body.sort_order ?? 0))) throw fail('Order must be an integer');
  return { name, slug, parent_id: body.parent_id || null, sort_order: Number(body.sort_order || 0), is_active: body.is_active !== false };
}
catalogAdminRoutes.get('/categories', run(async (_req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order').order('id');
  if (error) throw error;
  res.json({ categories: data });
}));
catalogAdminRoutes.post('/categories', run(async (req, res) => {
  const body = await categoryBody(req.body);
  const { data, error } = await supabase.from('categories').insert(body).select().single();
  if (error) throw error;
  res.status(201).json({ category: data });
}));
catalogAdminRoutes.put('/categories/:id', run(async (req, res) => {
  const keys = Object.keys(req.body);
  const lightweight = keys.length > 0 && keys.every(key => key === 'sort_order' || key === 'is_active');
  let body;
  if (lightweight) {
    body = {};
    if (Object.hasOwn(req.body, 'sort_order')) {
      if (typeof req.body.sort_order !== 'number' || !Number.isSafeInteger(req.body.sort_order) || req.body.sort_order < -2147483648 || req.body.sort_order > 2147483647) throw fail('Order must be a valid integer');
      body.sort_order = req.body.sort_order;
    }
    if (Object.hasOwn(req.body, 'is_active')) {
      if (typeof req.body.is_active !== 'boolean') throw fail('Active must be true or false');
      body.is_active = req.body.is_active;
    }
  } else {
    body = await categoryBody(req.body, req.params.id);
  }
  const { data, error } = await supabase.from('categories').update(body).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json({ category: data });
}));
catalogAdminRoutes.delete('/categories/:id', run(async (req, res) => {
  // Database function locks the category and atomically reassigns products or rejects deletion.
  const { error } = await supabase.rpc('remove_catalog_category', { category_id: req.params.id, replacement_id: req.body.replacement_id || null });
  if (error) return res.status(409).json({ error: error.message });
  res.json({ success: true });
}));
catalogAdminRoutes.get('/hero-images', run(async (_req, res) => {
  const { data, error } = await supabase.from('hero_images').select('*').order('sort_order');
  if (error) throw error;
  res.json({ images: data });
}));
function heroBody(body) {
  for (const key of ['desktop_url', 'mobile_url', 'video_url', 'mobile_video_url']) {
    if (key !== 'desktop_url' && !body[key]) continue;
    let url; try { url = new URL(body[key]); } catch { throw fail('Upload a desktop image before saving'); }
    if (url.protocol !== 'https:') throw fail('Images must use HTTPS');
  }
  if (!Number.isInteger(Number(body.sort_order ?? 0))) throw fail('Order must be an integer');
  const extra = {};
  for (const key of ['video_url', 'mobile_video_url']) {
    if (body[key] !== undefined) extra[key] = body[key] || null;
  }
  for (const [key, limit] of Object.entries({ eyebrow: 80, title: 120, description: 350, button_label: 60 })) {
    if (body[key] !== undefined) extra[key] = String(body[key]).trim().slice(0, limit);
  }
  if (body.button_url !== undefined) {
    const path = String(body.button_url).trim();
    if (path && (!path.startsWith('/') || path.startsWith('//') || /[\\\s]/.test(path))) throw fail('Button destination must be a local path such as /products');
    extra.button_url = path;
  }
  for (const key of ['desktop_position', 'mobile_position']) {
    if (body[key] !== undefined) {
      if (!['left center', 'center center', 'right center', '65% center'].includes(body[key])) throw fail('Choose a valid image focal point');
      extra[key] = body[key];
    }
  }
  if (body.overlay_opacity !== undefined) {
    const opacity = Number(body.overlay_opacity);
    if (!Number.isInteger(opacity) || opacity < 0 || opacity > 60) throw fail('Overlay must be between 0 and 60');
    extra.overlay_opacity = opacity;
  }
  return { desktop_url: body.desktop_url, mobile_url: body.mobile_url || null, alt: String(body.alt || '').slice(0, 200), sort_order: Number(body.sort_order || 0), is_active: body.is_active !== false, ...extra };
}
catalogAdminRoutes.post('/hero-images', run(async (req, res) => {
  const { count, error: countError } = await supabase.from('hero_images').select('id', { count: 'exact', head: true });
  if (countError) throw countError;
  if (count >= 3) return res.status(409).json({ error: 'Maximum 3 hero slides allowed, including images and videos. Edit or remove an existing slide.' });
  const { data, error } = await supabase.from('hero_images').insert(heroBody(req.body)).select().single();
  if (error?.code === '23514') return res.status(409).json({ error: error.message });
  if (error) throw error;
  res.status(201).json({ image: data });
}));
catalogAdminRoutes.put('/hero-images/:id', run(async (req, res) => {
  const { data, error } = await supabase.from('hero_images').update(heroBody(req.body)).eq('id', req.params.id).select().single();
  if (error) throw error;
  res.json({ image: data });
}));
catalogAdminRoutes.delete('/hero-images/:id', run(async (req, res) => {
  const { error } = await supabase.from('hero_images').delete().eq('id', req.params.id);
  if (error) throw error;
  res.json({ success: true });
}));
