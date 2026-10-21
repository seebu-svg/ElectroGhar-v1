import { POLICY, productPolicy } from './policies.js';

// Keep card claims derived from catalog values and the store's shared policies.
export function productCardData(product) {
  const name = String(product.name || '').trim() || 'Product details';
  const brand = String(product.brand || '').trim();
  const title = brand && !name.toLowerCase().includes(brand.toLowerCase()) ? `${brand} ${name}` : name;
  const price = Number(product.price);
  const original = Number(product.compare_at_price);
  const hasPrice = Number.isFinite(price) && price > 0;
  const hasDiscount = hasPrice && Number.isFinite(original) && original > price;
  const discount = hasDiscount ? Math.floor((original - price) / original * 100) : 0;
  const quantity = product.stock_qty == null || product.stock_qty === '' ? null : Number(product.stock_qty);
  const knownQuantity = Number.isInteger(quantity) && quantity >= 0;
  const soldOut = product.is_available === false || (knownQuantity && quantity === 0);
  const inStock = !soldOut && knownQuantity && quantity > 0;
  const stock = soldOut ? 'Out of stock' : inStock ? (quantity <= 3 ? `Only ${quantity} left` : 'In stock') : 'Confirm availability';
  const policy = productPolicy(product);
  const conditionText = [name, product.category, product.condition_type, product.condition_grade, product.description].filter(Boolean).join(' ');
  const asIs = policy.asIs || (policy.laptop && /\b(as[\s-]?is|broken|no power|does not work)\b/i.test(conditionText));
  const excluded = /\b(no warranty|without warranty|untested)\b/i.test(`${conditionText} ${product.warranty || ''}`);
  const warranty = asIs ? 'AS IS | No Checking Warranty' : policy.laptop && !excluded ? POLICY.warrantyLabel : 'Ask about warranty';
  const images = [...new Set([product.thumbnail_url, ...(Array.isArray(product.images) ? product.images : [])].filter(image => typeof image === 'string' && image.trim()))];
  const condition = [...new Set([product.condition_type, product.condition_grade].filter(value => typeof value === 'string' && value.trim()).map(value => value.trim()))].join(' · ');
  return { name, title, price, original, hasPrice, hasDiscount, discount, quantity, soldOut, inStock, stock, asIs, warranty, images, condition };
}
