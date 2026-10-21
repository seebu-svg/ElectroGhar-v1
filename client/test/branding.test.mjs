import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createLogoStore } from '../src/utils/siteLogo.mjs';
import { BRANDING } from '../src/utils/branding.mjs';

test('slow logo lookup never exposes a placeholder and is shared across components', async () => {
  let finish, calls = 0;
  const store = createLogoStore({ fetchLogo: () => { calls++; return new Promise(resolve => { finish = resolve; }); }, preload: async () => {} });
  const first = store.load();
  const second = store.load();
  assert.equal(store.getSnapshot(), null);
  assert.equal(calls, 1);
  finish('/approved.png?v=2');
  await Promise.all([first, second]);
  assert.equal(store.getSnapshot(), '/approved.png?v=2');
  await store.load();
  assert.equal(calls, 1);
});

test('failed lookup uses approved bundled artwork; failed update keeps working logo', async () => {
  const store = createLogoStore({ fetchLogo: async () => { throw Error('offline'); }, preload: async () => {} });
  await store.load();
  assert.equal(store.getSnapshot(), BRANDING.logo);
  let next = '/approved.png';
  const updates = createLogoStore({ fetchLogo: async () => next, preload: async src => { if (src === '/broken.png') throw Error('broken'); } });
  await updates.load();
  next = '/broken.png';
  await updates.load(true);
  assert.equal(updates.getSnapshot(), '/approved.png');
});

test('initial HTML and manifest reference existing content-versioned approved icons', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const manifest = JSON.parse(await readFile(new URL('../public/site.webmanifest', import.meta.url), 'utf8'));
  for (const [key, path] of Object.entries(BRANDING)) {
    const bytes = await readFile(new URL(`../public${path}`, import.meta.url));
    assert(path.includes(createHash('sha256').update(bytes).digest('hex').slice(0, 12)));
    if (key !== 'logo') assert(html.includes(path), `${key} must be in initial HTML`);
  }
  for (const icon of manifest.icons) assert(Object.values(BRANDING).includes(icon.src));
  assert(!html.includes('eg-2026'));
});
