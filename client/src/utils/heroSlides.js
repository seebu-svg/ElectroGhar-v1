import heroBanner from "../assets/hero-banner.webp";
import heroPerformance from "../assets/hero-performance.webp";
import heroEveryday from "../assets/hero-everyday.webp";

export const DEFAULT_SLIDES = [
  { id: 'everyday', desktop_url: heroEveryday, eyebrow: 'Your everyday upgrade', title: 'Good tech. Better possibilities.', description: 'Explore new and used laptops in Karachi for study, work and everything in between.', button_label: 'Explore laptops', button_url: '/products?category=laptops', alt: 'Silver laptop on a modern workspace' },
  { id: 'performance', desktop_url: heroPerformance, eyebrow: 'Make room for more', title: 'Power your next big idea.', description: 'Compare laptop specifications and find the performance your next project needs.', button_label: 'Find your upgrade', button_url: '/products?category=laptops', alt: 'Performance laptop in a charcoal studio' },
  { id: 'budget', desktop_url: heroBanner, eyebrow: 'Find your perfect fit', title: 'Your budget. Your next laptop.', description: 'Browse laptops and electronics up to Rs. 50,000, or ask our team for help choosing.', button_label: 'Shop up to Rs. 50,000', button_url: '/products?minPrice=1&maxPrice=50000', alt: 'Laptops and electronics at ElectroGhar' },
];
