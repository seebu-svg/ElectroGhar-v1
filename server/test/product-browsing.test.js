import test from 'node:test';
import assert from 'node:assert/strict';
import { discountRatio, selectDiscountedPage } from '../src/services/productBrowsing.js';

test('discount sorting uses all matches before pagination with stable ties', () => {
  const products = [
    { id: 'a', price: 80, compare_at_price: 100 },
    { id: 'c', price: 50, compare_at_price: 100 },
    { id: 'b', price: 50, compare_at_price: 100 },
    { id: 'd', price: 100 },
  ];
  const options = { sort: 'discount', order: 'desc', offset: 0, limit: 2 };
  assert.deepEqual(selectDiscountedPage(products, options).data.map(p => p.id), ['b', 'c']);
  assert.deepEqual(selectDiscountedPage(products, { ...options, offset: 2 }).data.map(p => p.id), ['a', 'd']);
  assert.deepEqual(selectDiscountedPage(products, { ...options, order: 'asc' }).data.map(p => p.id), ['d', 'a']);
  assert.equal(products[0].id, 'a');
});
test('deal counts and pages exclude missing, invalid, free and inverted pricing', () => {
  const invalid = [null, '', -1, 0, 'invalid', 110];
  for (const price of invalid) assert.equal(discountRatio({ price, compare_at_price: 100 }), 0);
  const products = [...invalid.map((price, id) => ({ id, price, compare_at_price: 100 })), { id: 'valid', price: '90', compare_at_price: '100' }];
  const result = selectDiscountedPage(products, { deals: true, sort: 'price', offset: 0, limit: 12 });
  assert.equal(result.count, 1);
  assert.equal(result.data[0].id, 'valid');
  assert.equal(selectDiscountedPage(products, { deals: true, offset: 1, limit: 12 }).data.length, 0);
});
