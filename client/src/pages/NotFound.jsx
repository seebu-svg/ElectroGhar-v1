import { Link, Navigate } from "react-router-dom";
import { SEOHead } from "../utils/seo";
export default function NotFound({ redirect }) {
  if (redirect) return <Navigate to={redirect} replace />;
  return <div className="max-w-3xl mx-auto px-4 py-20 text-center">
    <SEOHead title="Page Not Found" description="This page is unavailable. Browse ElectroGhar products or contact our Karachi store." noIndex />
    <h1 className="text-3xl font-bold text-white mb-4">Page not found</h1>
    <p className="text-gray-400 mb-6">The page may have moved or is no longer available.</p>
    <Link to="/products" className="text-brand-400">Browse products</Link>
  </div>;
}
