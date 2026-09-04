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
    case "Like New":
      return "bg-emerald-100 text-emerald-800";
    case "Excellent":
      return "bg-blue-100 text-blue-800";
    case "Good":
      return "bg-brand-100 text-brand-800";
    case "Fair":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

/**
 * Calculate discount percentage
 */
export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
