export const POLICY = {
  warrantyLabel: "30-Day Checking Warranty",
  asIsLabel: "AS IS | No Returns | No Checking Warranty",
  salesLabel: "No Refunds or Returns",
  warranty: "ElectroGhar provides a limited 30-day checking warranty on eligible working laptops, starting from the delivery date. It covers eligible functional defects identified within those 30 days. Laptops sold as dead, faulty, non-working, or for parts are not eligible.",
  exclusions: "The checking warranty excludes physical or liquid damage, misuse, power-related damage, unrelated software issues, disclosed cosmetic wear, normal battery wear, incompatible accessories, and unauthorized repairs or modifications that cause or contribute to the reported problem.",
  claims: "Contact ElectroGhar within 30 days of delivery with your order number and details of the issue. Eligible claims will be assessed for repair or another applicable warranty remedy. Contact us before sending a product for warranty assessment.",
  refunds: "All sales are final. ElectroGhar does not offer refunds for change-of-mind purchases. Refunds and other remedies required by applicable Pakistani consumer protection laws remain available.",
  returns: "ElectroGhar does not accept voluntary product returns or exchanges after purchase. Warranty inspection does not automatically entitle customers to a refund, exchange, or replacement. Mandatory consumer rights remain unaffected.",
  asIs: "Laptops sold as dead, faulty, non-working, or for parts are sold AS IS with their disclosed condition and limitations, without voluntary returns, exchanges, refunds for disclosed faults, or the voluntary checking warranty. Non-excludable rights under applicable Pakistani consumer protection laws remain unaffected.",
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
