import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryMoveUpdates, saveCategoryMove, sortCategories } from '../../client/src/utils/categoryActions.mjs';
const categories = Array.from({ length: 20 }, (_, index) => ({ id: `c${String(index).padStart(2, '0')}`, name: `Category ${index}`, parent_id: 'laptops', sort_order: index, is_active: true }));
test('moving one category saves exactly two positions with concurrent requests, without a list reload', async () => {
  const calls = [];
  const pending = [];
  const operation = saveCategoryMove(categories, categories[10], -1, (path, method, body) => {
    calls.push({ path, method, body });
    return new Promise(resolve => pending.push(() => resolve({ category: { ...categories.find(c => path.endsWith(c.id)), ...body } })));
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls, [{ path: '/categories/c10', method: 'PUT', body: { sort_order: 9 } }, { path: '/categories/c09', method: 'PUT', body: { sort_order: 10 } }]);
  pending.forEach(resolve => resolve());
  const saved = await operation;
  assert.deepEqual(saved.map(c => c.id), [...categories.slice(0, 9), categories[10], categories[9], ...categories.slice(11)].map(c => c.id));
  assert.equal(categories[10].sort_order, 10);
});
test('moves stay within the parent and boundary moves make no requests', async () => {
  const mixed = [...categories, { id: 'main', parent_id: null, sort_order: 0 }];
  for (const [category, direction] of [[categories[0], -1], [categories[19], 1], [mixed[20], 1]]) {
    assert.deepEqual(categoryMoveUpdates(mixed, category, direction), []);
    await saveCategoryMove(mixed, category, direction, () => { assert.fail('Unexpected request'); });
  }
});
test('gapped positions need only a two-row swap', () => {
  const rows = [{ id: 'a', sort_order: 10 }, { id: 'b', sort_order: 100 }, { id: 'c', sort_order: 1000 }];
  assert.deepEqual(categoryMoveUpdates(rows, rows[1], 1), [{ id: 'b', sort_order: 1000 }, { id: 'c', sort_order: 100 }]);
});
test('tied positions normalize changed rows and preserve all other relative ordering', () => {
  const rows = [{ id: 'a', sort_order: 0 }, { id: 'z', sort_order: 0 }, { id: 'b', sort_order: 1 }, { id: 'y', sort_order: 1 }];
  const updates = categoryMoveUpdates(rows, rows[1], 1);
  const reordered = sortCategories(rows.map(row => ({ ...row, ...updates.find(update => update.id === row.id) })));
  assert.deepEqual(reordered.map(row => row.id), ['a', 'b', 'z', 'y']);
  assert(!updates.some(update => update.id === 'a'));
});
test('failed moves settle all writes before rejecting, so reconciliation cannot race a late commit', async () => {
  let finish;
  let completed = false;
  let settled = false;
  const operation = saveCategoryMove(categories, categories[10], -1, path => path.endsWith('c10')
    ? Promise.reject(new Error('Connection lost'))
    : new Promise(resolve => { finish = () => { completed = true; resolve({ category: categories[9] }); }; }));
  operation.catch(() => { settled = true; });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(settled, false);
  finish();
  await assert.rejects(operation, /Connection lost/);
  assert.equal(completed, true);
});
