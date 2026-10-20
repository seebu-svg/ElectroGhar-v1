export const POLICY = {
  warrantyLabel: "30-Day Checking Warranty",
  asIsLabel: "AS IS | No Returns | No Checking Warranty",
  salesLabel: "No Refunds or Returns",
  warranty: "ElectroGhar provides a limited 30-day checking warranty on eligible functional laptops, starting from the delivery date. It covers eligible functional defects identified within those 30 days. Laptops sold as dead, faulty, non-working, or for parts are not eligible.",
  exclusions: "Physical damage, liquid damage, misuse, unauthorized repairs, and accidental damage are excluded from the checking warranty.",
  claims: "Contact ElectroGhar within 30 days of delivery with your order number and details of the issue. Eligible claims will be assessed for repair or another applicable warranty remedy. Contact us before sending a product for warranty assessment.",
  refunds: "All sales are final. ElectroGhar does not offer refunds for purchased products, except where required by applicable law.",
  returns: "Products cannot be returned or exchanged after purchase, except where required by applicable law or an expressly stated warranty remedy applies.",
  asIs: "Laptops sold as dead, faulty, non-working, or for parts are strictly sold AS IS, without returns, refunds, or checking warranty, subject to applicable consumer protection laws.",
  rights: "Nothing in these policies limits any rights or remedies that cannot be excluded under applicable Pakistani consumer protection laws.",
};

// Use the catalog's existing category and condition information; do not alter products.
export function productPolicy(product) {
  const category = String(product.category || "").toLowerCase();
  const name = String(product.name || "");
  const accessory = /accessor|charger|batter|adapter|dock|stand|sleeve|bag|keyboard|screen/.test(category);
  const laptop = !accessory && (/laptop|macbook|ultrabook|convertible/.test(category) || /\b(laptop|macbook|ultrabook)\b/i.test(name));
  const condition = [product.condition_type, product.condition_grade, category, name, product.description].filter(Boolean).join(" ");
  const asIs = laptop && /\b(dead|faulty|non[\s_-]?working|not working|for[\s_-]parts|parts only)\b/i.test(condition);
  return { laptop, asIs, warranty: asIs ? POLICY.asIsLabel : laptop ? POLICY.warrantyLabel : product.warranty };
}
