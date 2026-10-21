// Share the same conservative discount calculation used by product cards.
export function discountRatio(product) {
  const price = Number(product.price);
  const original = Number(product.compare_at_price);
  return Number.isFinite(price) && price > 0 && Number.isFinite(original) && original > price
    ? (original - price) / original : 0;
}

export function selectDiscountedPage(products, { deals, sort, order, offset, limit }) {
  const matches = deals ? products.filter(product => discountRatio(product) > 0) : [...products];
  if (sort === 'discount') matches.sort((a, b) => {
    const difference = discountRatio(a) - discountRatio(b);
    return difference ? difference * (order === 'asc' ? 1 : -1) : String(a.id).localeCompare(String(b.id));
  });
  return { data: matches.slice(offset, offset + limit), count: matches.length };
}
