import test from 'node:test';
import assert from 'node:assert/strict';
import { productCardData } from '../src/utils/productCardData.mjs';

const laptop = { name: 'Lenovo ThinkPad L540', brand: 'Lenovo', category: 'laptops', price: '35000', stock_qty: 4, is_available: true, condition_type: 'used', condition_grade: 'Good' };

test('uses catalog pricing only and never advertises an invalid discount', () => {
  for (const compare_at_price of [null, '', 'invalid', 0, -1, 35000, 30000]) {
    assert.equal(productCardData({ ...laptop, compare_at_price }).hasDiscount, false);
  }
  const card = productCardData({ ...laptop, compare_at_price: '40000' });
  assert.equal(card.original, 40000);
  assert.equal(card.discount, 12); // Conservative whole percent; never rounds savings up.
  for (const price of [null, '', 'invalid', -1, 0]) {
    assert.equal(productCardData({ ...laptop, price, compare_at_price: 40000 }).hasDiscount, false);
  }
});
test('explicit unavailability and zero inventory take precedence', () => {
  assert.equal(productCardData({ ...laptop, is_available: false }).stock, 'Out of stock');
  assert.equal(productCardData({ ...laptop, stock_qty: '0' }).stock, 'Out of stock');
  assert.equal(productCardData({ ...laptop, stock_qty: 2 }).stock, 'Only 2 left');
  for (const stock_qty of [null, undefined, '', 'invalid', -1, 1.5]) {
    assert.equal(productCardData({ ...laptop, stock_qty }).stock, 'Confirm availability');
  }
});
test('functional laptops get the shared checking warranty, accessories do not', () => {
  assert.equal(productCardData(laptop).warranty, '30-Day Checking Warranty');
  assert.equal(productCardData({ ...laptop, name: 'Laptop adapter', category: 'accessories' }).warranty, 'Ask about warranty');
  assert.equal(productCardData({ ...laptop, warranty: 'No warranty' }).warranty, 'Ask about warranty');
});
test('dead and non-working laptops never receive checking warranty claims', () => {
  for (const description of ['Dead laptop', 'Non-working laptop', 'For parts only', 'AS IS', 'Broken laptop', 'No power']) {
    const card = productCardData({ ...laptop, description });
    assert.equal(card.asIs, true);
    assert.equal(card.warranty, 'AS IS | No Checking Warranty');
  }
});
test('preserves title and actual condition without duplicating the brand', () => {
  assert.equal(productCardData(laptop).title, laptop.name);
  assert.equal(productCardData({ ...laptop, name: 'ThinkPad L540' }).title, laptop.name);
  assert.equal(productCardData(laptop).condition, 'used · Good');
});
test('deduplicates images and ignores unusable image entries', () => {
  const card = productCardData({ ...laptop, thumbnail_url: '/one.webp', images: ['/one.webp', null, '', '/two.webp'] });
  assert.deepEqual(card.images, ['/one.webp', '/two.webp']);
});
