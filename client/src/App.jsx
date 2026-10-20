import { lazy, Suspense } from "react";
import { SEOHead } from "./utils/seo";
import NotFound from "./pages/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/ui/ScrollToTop";
import AdminLayout from "./components/admin/AdminLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blogs from "./pages/Blogs";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import BlogDetail from "./pages/BlogDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PurchasePolicy from "./pages/PurchasePolicy";
import TermsOfService from "./pages/TermsOfService";
const AdminLogin = lazy(() => import("./pages/admin/LoginPage"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminBlogs = lazy(() => import("./pages/admin/Blogs"));
const BlogForm = lazy(() => import("./pages/admin/BlogForm"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

const Categories = lazy(() => import("./pages/admin/Categories"));
const HeroImages = lazy(() => import("./pages/admin/HeroImages"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-[60vh]" aria-label="Loading page" />}>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────── */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/warranty-policy" element={<PurchasePolicy page="warranty" />} />
            <Route path="/refund-policy" element={<PurchasePolicy page="refund" />} />
            <Route path="/return-policy" element={<PurchasePolicy page="return" />} />
            <Route path="/faq" element={<NotFound redirect="/faqs" />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/faqs" element={<PurchasePolicy page="faq" />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Route>

          {/* ── Admin Login (no layout) ───────────────────────── */}
          <Route path="/admin/login" element={<><SEOHead title="Admin Login" noIndex /><AdminLogin /></>} />

          {/* ── Admin Dashboard (protected) ────────────────────── */}
          <Route element={<><SEOHead title="Administration" noIndex /><AdminLayout /></>}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/hero-images" element={<HeroImages />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/blogs" element={<AdminBlogs />} />
            <Route path="/admin/blogs/new" element={<BlogForm />} />
            <Route path="/admin/blogs/:id/edit" element={<BlogForm />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Suspense>
    </BrowserRouter>
  );
}
