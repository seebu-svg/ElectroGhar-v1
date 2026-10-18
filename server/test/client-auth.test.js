import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = (await readFile(new URL('../../client/src/utils/adminFetch.js', import.meta.url), 'utf8')).replace("import { API_BASE } from './api';", "const API_BASE = '/api';");
const { adminFetch } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
let items, events;
function reset() {
  items = new Map([['admin_token','old'],['admin_refresh_token','refresh'],['product-draft:admin:p','unsaved']]); events = [];
  globalThis.localStorage = { getItem: k => items.get(k), setItem: (k,v) => items.set(k,v) };
  globalThis.window = { dispatchEvent: e => events.push(e.type) };
}
const response = (status, body = {}) => ({ status, ok: status < 400, json: async () => body });
test('concurrent expired requests share refresh and retry with rotated token', async () => {
  reset(); let refreshCount = 0;
  globalThis.fetch = async (url, options) => {
    if (url === '/api/admin/refresh') { refreshCount++; await new Promise(r => setTimeout(r, 10)); return response(200, { token: 'new', refreshToken: 'rotated' }); }
    return response(options.headers.Authorization === 'Bearer new' ? 200 : 401);
  };
  const results = await Promise.all([adminFetch('/api/admin/products/p'),adminFetch('/api/admin/products/p')]);
  assert(results.every(r => r.ok)); assert.equal(refreshCount, 1); assert.equal(items.get('admin_refresh_token'),'rotated');
});
test('failed refresh requests login while preserving unsaved edits', async () => {
  reset(); globalThis.fetch = async () => response(401);
  await assert.rejects(adminFetch('/api/admin/products/p'), /log in again/);
  assert.equal(items.get('product-draft:admin:p'),'unsaved'); assert.deepEqual(events,['admin-session-expired']);
});
test('unauthorized user gets clear permission error without refresh', async () => {
  reset(); let requests = 0; globalThis.fetch = async () => { requests++; return response(403); };
  await assert.rejects(adminFetch('/api/admin/products/p'), /Administrator permission/); assert.equal(requests,1);
});
