import test from 'node:test';
import assert from 'node:assert/strict';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.SUPABASE_ANON_KEY = 'test-key';
const { supabase, supabaseAuth } = await import('../src/config/supabase.js');
const { app } = await import('../src/app.js');
const { requireAdmin } = await import('../src/middleware/auth.js');
const admin = { id: 'admin', app_metadata: { role: 'admin' } };
function reply() {
  return { statusCode: 200, headers: {}, set(key, value) { this.headers[key] = value; return this; }, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
}
for (const [label, token, user, status] of [
  ['missing token', null, admin, 401],
  ['invalid token', 'bad', null, 401],
  ['expired token', 'expired', null, 401],
  ['ordinary authenticated user', 'valid', { id: 'user', user_metadata: { role: 'admin' } }, 403],
  ['valid admin token', 'valid', admin, 200],
]) test(label, async () => {
  supabaseAuth.auth.getUser = async () => ({ data: { user }, error: user ? null : { message: 'Invalid JWT' } });
  const res = reply(); let next = false;
  await requireAdmin({ headers: { authorization: token ? `Bearer ${token}` : undefined } }, res, () => { next = true; });
  assert.equal(res.statusCode, status); assert.equal(next, status === 200);
});
// Exercise actual Express route handlers without opening a network listener.
async function route(path, method, req) {
  for (const layer of app._router.stack) {
    if (layer.route?.path === path && layer.route.methods[method]) {
      const res = reply();
      await layer.route.stack.at(-1).handle(req, res, error => { throw error; });
      return res;
    }
    if (!layer.handle.stack) continue;
    const match = layer.handle.stack.find(l => l.route?.path === path && l.route.methods[method]);
    if (match) { const res = reply(); await match.route.stack.at(-1).handle(req, res, error => { throw error; }); return res; }
  }
  throw new Error(`Missing route ${method} ${path}`);
}
function query(result, calls) {
  const q = {};
  for (const method of ['select','eq','order','limit','insert','update','delete','single','maybeSingle','ilike']) q[method] = (...args) => { calls.push([method, ...args]); return q; };
  q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return q;
}
async function userRoute(method, path, actor, request = {}) {
  supabaseAuth.auth.getUser = async () => ({ data: { user: actor }, error: null });
  const router = app._router.stack.find(l => l.handle.stack?.some(s => s.route?.path === '/change-password')).handle;
  const matched = router.stack.find(l => l.route?.path === path && l.route.methods[method]);
  const res = reply();
  const req = { headers: { authorization: 'Bearer valid' }, ...request };
  for (const layer of matched.route.stack) {
    let advance = false;
    await layer.handle(req, res, error => { if (error) throw error; advance = true; });
    if (!advance) break;
  }
  return res;
}
const mainAdmin = { id: 'main', email: 'admin@electroghar.pk', app_metadata: { role: 'admin' } };
test('secondary admins cannot create or delete admins, including with forged main metadata', async () => {
  const actor = { ...admin, email: 'other@example.com', app_metadata: { role: 'admin', is_main_admin: true } };
  let writes = 0;
  supabase.auth.admin.createUser = supabase.auth.admin.deleteUser = async () => { writes++; };
  assert.equal((await userRoute('post', '/users', actor, { body: { email: 'new@example.com', password: 'secret123' } })).statusCode, 403);
  assert.equal((await userRoute('delete', '/users/:id', actor, { params: { id: 'main' } })).statusCode, 403);
  assert.equal(writes, 0);
});
test('main administrator is protected from deletion and duplicate creation', async () => {
  let deleted = false;
  supabase.auth.admin.getUserById = async () => ({ data: { user: mainAdmin }, error: null });
  supabase.auth.admin.deleteUser = async () => { deleted = true; };
  assert.equal((await userRoute('delete', '/users/:id', mainAdmin, { params: { id: 'main' } })).statusCode, 400);
  assert.equal((await userRoute('delete', '/users/:id', mainAdmin, { params: { id: 'alias' } })).statusCode, 403);
  assert.equal((await userRoute('post', '/users', mainAdmin, { body: { email: ' ADMIN@ELECTROGHAR.PK ', password: 'secret123' } })).statusCode, 400);
  assert.equal(deleted, false);
});
test('main administrator can create and delete secondary admins but not ordinary accounts', async () => {
  let payload, deleted;
  supabase.auth.admin.createUser = async body => { payload = body; return { data: { user: { id: 'new', email: body.email } }, error: null }; };
  assert.equal((await userRoute('post', '/users', mainAdmin, { body: { email: 'new@example.com', password: 'secret123' } })).statusCode, 201);
  assert.deepEqual(payload.app_metadata, { role: 'admin' });
  supabase.auth.admin.getUserById = async () => ({ data: { user: admin }, error: null });
  supabase.auth.admin.deleteUser = async id => { deleted = id; return { error: null }; };
  assert.equal((await userRoute('delete', '/users/:id', mainAdmin, { params: { id: 'admin' } })).statusCode, 200);
  assert.equal(deleted, 'admin');
  supabase.auth.admin.getUserById = async () => ({ data: { user: { id: 'customer' } }, error: null });
  assert.equal((await userRoute('delete', '/users/:id', mainAdmin, { params: { id: 'customer' } })).statusCode, 400);
});
test('admin listing exposes management capability and protects the main account', async () => {
  supabase.auth.admin.listUsers = async () => ({ data: { users: [mainAdmin, admin, { id: 'customer' }] }, error: null });
  const main = await userRoute('get', '/users', mainAdmin);
  assert.equal(main.body.can_manage_users, true);
  assert.equal(main.body.users.length, 2);
  assert.equal(main.body.users[0].is_main_admin, true);
  const secondary = await userRoute('get', '/users', admin);
  assert.equal(secondary.body.can_manage_users, false);
  assert.deepEqual(secondary.body.users.map(u => u.id), ['admin']);
});
test('public hero images fall back only when the table is missing', async () => {
  for (const code of ['PGRST205', '42P01']) {
    supabase.from = () => query({ data: null, error: { code } }, []);
    const res = await route('/api/hero-images', 'get', {});
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { images: [] });
  }
  const error = { code: '42501', message: 'permission denied' };
  supabase.from = () => query({ data: null, error }, []);
  await assert.rejects(route('/api/hero-images', 'get', {}), e => e === error);
});
test('public hero images return configured active images in order', async () => {
  const calls = [];
  const images = [{ id: 'hero', desktop_url: 'https://example.com/hero.png' }];
  supabase.from = () => query({ data: images, error: null }, calls);
  const res = await route('/api/hero-images', 'get', {});
  assert.deepEqual(res.body, { images });
  assert(calls.some(c => c[0] === 'eq' && c[1] === 'is_active' && c[2] === true));
  assert(calls.some(c => c[0] === 'order' && c[1] === 'sort_order'));
  assert(calls.some(c => c[0] === 'limit' && c[1] === 3));
});
test('product editing strips generated fields and validates category', async () => {
  const calls = [];
  supabase.from = table => query({ data: table === 'categories' ? { slug: 'laptops-hp', is_active: true } : { id: 'p' }, error: null }, calls);
  await route('/products/:id', 'put', { params: { id: 'p' }, body: { description: 'Updated', category: 'laptops-hp', search_text: 'generated', id: 'forged', created_at: 'bad' } });
  const payload = calls.find(c => c[0] === 'update')[1];
  assert.equal(payload.description, 'Updated'); assert.equal(payload.search_text, undefined); assert.equal(payload.id, undefined);
});
test('category updates retain slugs and persist ordering/activation', async () => {
  const calls = [];
  supabase.from = () => query({ data: [{ id: 'c', name: 'HP', slug: 'laptops-hp', parent_id: null }], error: null }, calls);
  await route('/categories/:id', 'put', { params: { id: 'c' }, body: { name: 'HP computers', slug: 'changed', sort_order: 4, is_active: false } });
  const body = calls.find(c => c[0] === 'update')[1];
  assert.equal(body.slug, 'laptops-hp'); assert.equal(body.sort_order, 4); assert.equal(body.is_active, false);
});
test('category order and activation changes skip full catalog validation and touch only supplied fields', async () => {
  for (const patch of [{ sort_order: 3 }, { is_active: false }, { sort_order: 1, is_active: true }]) {
    const calls = [];
    supabase.from = () => query({ data: { id: 'c', ...patch }, error: null }, calls);
    const res = await route('/categories/:id', 'put', { params: { id: 'c' }, body: patch });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls.map(call => call[0]), ['update', 'eq', 'select', 'single']);
    assert.deepEqual(calls[0][1], patch);
  }
});
test('lightweight category updates reject invalid order and activation values before database access', async () => {
  for (const patch of [{ sort_order: '1' }, { sort_order: null }, { sort_order: 1.5 }, { sort_order: 2147483648 }, { is_active: 'false' }, { is_active: null }]) {
    let queries = 0;
    supabase.from = () => { queries++; throw new Error('Unexpected database call'); };
    await assert.rejects(route('/categories/:id', 'put', { params: { id: 'c' }, body: patch }), error => error.status === 400);
    assert.equal(queries, 0);
  }
});
test('category deletion delegates reassignment to the atomic database function', async () => {
  let args;
  supabase.rpc = async (name, body) => { args = { name, body }; return { error: null }; };
  await route('/categories/:id', 'delete', { params: { id: 'c' }, body: { replacement_id: 'other' } });
  assert.deepEqual(args, { name: 'remove_catalog_category', body: { category_id: 'c', replacement_id: 'other' } });
});
test('hero image creation persists desktop/mobile and order', async () => {
  const calls = [];
  supabase.from = () => query({ data: { id: 'hero' }, error: null }, calls);
  await route('/hero-images', 'post', { body: { desktop_url: 'https://example.com/desktop.png', mobile_url: 'https://example.com/mobile.png', sort_order: 3, alt: 'Summer offers' } });
  const body = calls.find(c => c[0] === 'insert')[1];
  assert.equal(body.mobile_url, 'https://example.com/mobile.png'); assert.equal(body.sort_order, 3);
});
test('hero images reject unsafe URLs', async () => {
  await assert.rejects(route('/hero-images', 'post', { body: { desktop_url: 'javascript:alert(1)' } }), /HTTPS/);
});

test('hero slide content and presentation settings are persisted', async () => {
  const calls = [];
  supabase.from = () => query({ data: { id: 'hero' }, error: null }, calls);
  await route('/hero-images', 'post', { body: { desktop_url: 'https://example.com/hero.webp', title: 'New laptops', button_label: 'Shop', button_url: '/products?category=laptops', desktop_position: 'right center', mobile_position: 'center center', overlay_opacity: 20 } });
  const body = calls.find(c => c[0] === 'insert')[1];
  assert.equal(body.title, 'New laptops');
  assert.equal(body.button_url, '/products?category=laptops');
  assert.equal(body.overlay_opacity, 20);
  assert.equal(body.mobile_position, 'center center');
});
test('hero slides reject unsafe destinations and invalid presentation settings', async () => {
  for (const patch of [{ button_url: '//example.com' }, { button_url: 'javascript:alert(1)' }, { button_url: '/\\evil.com' }, { overlay_opacity: 80 }, { desktop_position: 'invalid' }]) {
    await assert.rejects(route('/hero-images', 'post', { body: { desktop_url: 'https://example.com/hero.webp', ...patch } }), error => error.status === 400);
  }
});

test('hero image replacement and removal use the persisted record', async () => {
  const calls = [];
  supabase.from = () => query({ data: { id: 'hero' }, error: null }, calls);
  await route('/hero-images/:id', 'put', { params: { id: 'hero' }, body: { desktop_url: 'https://example.com/replaced.png', mobile_url: '', sort_order: 1, is_active: false } });
  assert.equal(calls.find(c => c[0] === 'update')[1].is_active, false);
  await route('/hero-images/:id', 'delete', { params: { id: 'hero' } });
  assert(calls.some(c => c[0] === 'delete'));
});
test('upload rejects a forged image MIME type before storage upload', async () => {
  const res = await route('/', 'post', { file: { buffer: Buffer.from('not an image'), mimetype: 'image/png' } });
  assert.equal(res.statusCode, 400); assert.match(res.body.error, /content does not match/);
});
test('logo replacement overwrites one object and returns its refreshed URL', async () => {
  let uploaded;
  supabase.storage.listBuckets = async () => ({ data: [{ name: 'uploads' }] });
  supabase.storage.from = () => ({
    upload: async (path, buffer, options) => { uploaded = { path, options }; return { data: { path }, error: null }; },
    getPublicUrl: path => ({ data: { publicUrl: `https://example.com/${path}` } }),
  });
  const res = await route('/', 'post', { query: { folder: 'logo' }, file: { originalname: 'new-logo.png', mimetype: 'image/png', buffer: Buffer.from([137,80,78,71,13,10,26,10]) } });
  assert.equal(uploaded.path, 'branding/logo');
  assert.equal(uploaded.options.upsert, true);
  assert.match(res.body.url, /branding\/logo\?v=\d+/);
});
test('logo cannot be deleted through the upload API', async () => {
  let removed = false;
  supabase.storage.from = () => ({ remove: async () => { removed = true; return { error: null }; } });
  const res = await route('/', 'delete', { body: { path: 'branding/logo' } });
  assert.equal(res.statusCode, 400);
  assert.equal(removed, false);
});
test('public logo resolves the replacement and falls back when absent', async () => {
  let objects = [];
  supabase.storage.from = () => ({
    list: async () => ({ data: objects, error: null }),
    getPublicUrl: path => ({ data: { publicUrl: `https://example.com/${path}` } }),
  });
  assert.deepEqual((await route('/api/logo', 'get', {})).body, { url: null });
  objects = [{ name: 'logo', updated_at: '2026-10-12' }];
  const res = await route('/api/logo', 'get', {});
  assert.equal(res.body.url, 'https://example.com/branding/logo?v=2026-10-12');
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
test('hidden parent categories suppress children in product visibility', async () => {
  const { visibleCategorySlugs } = await import('../src/services/catalog.js');
  supabase.from = () => query({ data: [{ id: 'root', slug: 'laptops', parent_id: null }, { id: 'a', slug: 'laptops-hp', parent_id: 'root' }, { id: 'b', slug: 'hidden-child', parent_id: 'inactive-parent' }], error: null }, []);
  assert.deepEqual(await visibleCategorySlugs(), ['laptops','laptops-hp']);
});


test('hero videos persist and can be removed without replacing the poster', async () => {
  const calls = [];
  supabase.from = () => query({ data: { id: 'hero' }, error: null }, calls);
  await route('/hero-images/:id', 'put', { params: { id: 'hero' }, body: { desktop_url: 'https://example.com/poster.webp', video_url: 'https://example.com/hero.mp4', mobile_video_url: '' } });
  assert.equal(calls.find(c => c[0] === 'update')[1].video_url, 'https://example.com/hero.mp4');
  assert.equal(calls.find(c => c[0] === 'update')[1].mobile_video_url, null);
  await assert.rejects(route('/hero-images', 'post', { body: { desktop_url: 'https://example.com/poster.webp', video_url: 'javascript:alert(1)' } }), /HTTPS/);
});
test('hero video upload rejects forged content and missing files', async () => {
  assert.equal((await route('/hero-video', 'post', {})).statusCode, 400);
  assert.equal((await route('/hero-video', 'post', { file: { mimetype: 'video/mp4', buffer: Buffer.from('not a video') } })).statusCode, 400);
});
test('hero video upload uses the dedicated video bucket and correct content type', async () => {
  let uploaded;
  supabase.storage.from = bucket => ({
    upload: async (path, buffer, options) => { uploaded = { bucket, path, options }; return { data: { path }, error: null }; },
    getPublicUrl: path => ({ data: { publicUrl: `https://example.com/${path}` } }),
  });
  const buffer = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom')]);
  const res = await route('/hero-video', 'post', { file: { mimetype: 'video/mp4', buffer } });
  assert.equal(res.statusCode, 200);
  assert.equal(uploaded.bucket, 'hero-videos');
  assert.equal(uploaded.options.contentType, 'video/mp4');
  assert.match(res.body.url, /\.mp4$/);
});
