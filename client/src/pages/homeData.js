/* ── Static data for Home page sections ───────────────────────── */

export const QUICK_LINKS = [
  { label: "Dell", params: { brand: "Dell" } },
  { label: "HP", params: { brand: "HP" } },
  { label: "Lenovo", params: { brand: "Lenovo" } },
  { label: "Apple", params: { brand: "Apple" } },
  { label: "Gaming", params: { category: "gaming-laptops" } },
  { label: "Business", params: { category: "business-laptops" } },
  { label: "Student", params: { category: "student-laptops" } },
  { label: "Under PKR 50,000", params: { maxPrice: "50000" } },
];

export const BRANDS = [
  {
    name: "Dell",
    slug: "Dell",
    tagline: "Business-ready. Reliable. Powerful.",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "HP",
    slug: "HP",
    tagline: "Professional laptops for everyday performance.",
    gradient: "from-sky-500 to-sky-700",
  },
  {
    name: "Lenovo",
    slug: "Lenovo",
    tagline: "Built for productivity and durability.",
    gradient: "from-red-500 to-red-700",
  },
  {
    name: "Apple",
    slug: "Apple",
    tagline: "Premium performance and design.",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    name: "ASUS",
    slug: "ASUS",
    tagline: "From ultrabooks to gaming powerhouses.",
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    name: "Acer",
    slug: "Acer",
    tagline: "Great value laptops for every user.",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    name: "MSI",
    slug: "MSI",
    tagline: "Gaming performance, built to last.",
    gradient: "from-rose-600 to-rose-800",
  },
  {
    name: "Microsoft Surface",
    slug: "Microsoft",
    tagline: "Sleek, modern, and incredibly portable.",
    gradient: "from-cyan-500 to-cyan-700",
  },
];

export const USE_CASES = [
  {
    icon: "💼",
    name: "Business",
    slug: "business-laptops",
    desc: "Reliable laptops for work and productivity.",
  },
  {
    icon: "🎓",
    name: "Students",
    slug: "student-laptops",
    desc: "Affordable laptops for study, assignments and everyday use.",
  },
  {
    icon: "🎮",
    name: "Gaming",
    slug: "gaming-laptops",
    desc: "Powerful machines for gaming and entertainment.",
  },
  {
    icon: "🎨",
    name: "Creators",
    slug: "creator-laptops",
    desc: "Performance laptops for design, editing and creative work.",
  },
  {
    icon: "💻",
    name: "Everyday",
    slug: "ultrabooks",
    desc: "Great-value laptops for daily computing.",
  },
];

export const WHY_ITEMS = [
  {
    icon: "ShieldCheck",
    title: "Quality Checked",
    desc: "Every laptop is inspected before listing.",
  },
  {
    icon: "BadgeCheck",
    title: "Honest Condition",
    desc: "We clearly describe the condition of our laptops.",
  },
  {
    icon: "Tag",
    title: "Latest Prices",
    desc: "Get the current price directly from our team.",
  },
  {
    icon: "MessageCircle",
    title: "WhatsApp Support",
    desc: "Talk to us before making your decision.",
  },
  {
    icon: "Truck",
    title: "Delivery Options",
    desc: "Ask about delivery options available for your location.",
  },
];

export const STEPS = [
  {
    num: "01",
    title: "Find Your Laptop",
    desc: "Browse our latest collection and find a laptop that fits your needs.",
  },
  {
    num: "02",
    title: "Ask on WhatsApp",
    desc: "Send us the product you're interested in and get the latest price and availability.",
  },
  {
    num: "03",
    title: "Confirm Your Order",
    desc: "Discuss the details with our team and complete your purchase.",
  },
];

export const SEO_LINKS = [
  { label: "Dell Laptops", to: "/products?brand=Dell" },
  { label: "HP Laptops", to: "/products?brand=HP" },
  { label: "Lenovo Laptops", to: "/products?brand=Lenovo" },
  { label: "Gaming Laptops", to: "/products?category=gaming-laptops" },
  { label: "Business Laptops", to: "/products?category=business-laptops" },
  { label: "Student Laptops", to: "/products?category=student-laptops" },
];

export const ARRIVAL_BADGES = ["NEW ARRIVAL", "BEST VALUE", "LIMITED STOCK"];
