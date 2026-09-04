/**
 * Format number as PKR currency string
 */
export function formatPrice(amount) {
  if (!amount && amount !== 0) return "Contact for Price";
  return `PKR ${Number(amount).toLocaleString("en-PK")}`;
}

/**
 * Build WhatsApp deep link for product inquiry
 */
export function buildWhatsAppLink(phoneNumber, productName, slug) {
  const phone = phoneNumber.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    `Hi ElectroGhar! I'm interested in the *${productName}*.\n\nProduct: ${productName}\nLink: ${window.location.origin}/product/${slug}\n\nPlease share the price and availability.`
  );
  return `https://wa.me/${phone}?text=${message}`;
}

/**
 * Get condition badge color class
 */
export function conditionColor(grade) {
  switch (grade) {
    case "New":
    case "Like New":
      return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 backdrop-blur-sm";
    case "Excellent":
      return "bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-sm";
    case "Good":
      return "bg-brand-500/10 text-brand-400 border border-brand-500/20 backdrop-blur-sm";
    case "Fair":
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20 backdrop-blur-sm";
    default:
      return "bg-gray-500/10 text-gray-400 border border-gray-500/20 backdrop-blur-sm";
  }
}

/**
 * Calculate discount percentage
 */
export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/**
 * Format an ISO date as a readable blog date, e.g. "Aug 28, 2026"
 */
export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Capitalize each word (blog category names from slugs)
 */
export function titleCase(str) {
  return String(str || "")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
