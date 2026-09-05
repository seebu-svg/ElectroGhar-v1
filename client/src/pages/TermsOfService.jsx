import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { SEOHead } from "../utils/seo";

const SITE = "ElectroGhar";
const EMAIL = "hello@electroghar.pk";
const PHONE = "+92 300 1234567";

export default function TermsOfService() {
  return (
    <div className="bg-surface-alt min-h-screen">
      <SEOHead
        title="Terms of Service"
        description="ElectroGhar's terms of service cover orders, pricing, delivery, returns, warranties and your responsibilities when using our catalog or WhatsApp ordering."
        canonical={`${typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk"}/terms`}
        type="website"
      />

      <header className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-400 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-xl bg-brand-600/15 border border-brand-600/30 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-brand-500" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Terms of Service
            </h1>
          </div>
          <p className="text-sm text-gray-500">Last updated: September 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <article className="prose prose-invert prose-brand max-w-none">
          <p className="text-gray-300 leading-relaxed">
            Welcome to {SITE}. These Terms of Service govern your use of our website and any
            purchase or inquiry made through WhatsApp. By using our services, you agree to these
            terms.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            1. Orders & Pricing
          </h2>
          <ul className="space-y-3 text-gray-400 list-disc pl-5">
            <li>
              All prices shown on the website are indicative and may change based on current market
              rates and stock availability.
            </li>
            <li>
              Final price, availability, and delivery charges are confirmed only when you message us
              on WhatsApp and we confirm your order.
            </li>
            <li>We reserve the right to refuse or cancel any order at our discretion.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            2. Product Condition
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We clearly label every product as New, Used, or Refurbished and provide a condition
            grade (New, Like New, Excellent, Good, Fair). Product descriptions and images represent
            the actual item as closely as possible. Please confirm any specific details on WhatsApp
            before purchasing.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            3. Payment & Delivery
          </h2>
          <ul className="space-y-3 text-gray-400 list-disc pl-5">
            <li>Payment methods and delivery options are arranged via WhatsApp after confirmation.</li>
            <li>
              Delivery timelines depend on your location and courier availability. We are not
              responsible for delays caused by courier services or force majeure events.
            </li>
            <li>
              Risk of loss or damage passes to you once the product is handed over to the courier.
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            4. Returns & Refunds
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We accept returns only if the product is materially different from the description or is
            defective upon delivery. You must notify us within 48 hours of receiving the item. The
            product must be returned in the same condition with all original accessories. Refunds
            are processed after inspection.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            5. Warranty
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Warranty terms, if any, are listed on the individual product page and confirmed on
            WhatsApp. Warranty coverage does not include physical damage, liquid damage, or
            unauthorized repairs.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            6. User Responsibilities
          </h2>
          <ul className="space-y-3 text-gray-400 list-disc pl-5">
            <li>You agree to provide accurate contact and delivery information.</li>
            <li>
              You will not misuse our website, attempt unauthorized access, or use our content for
              unlawful purposes.
            </li>
            <li>
              Product images and descriptions are our property and may not be copied or reused
              without permission.
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-gray-400 leading-relaxed">
            To the maximum extent permitted by law, {SITE} shall not be liable for any indirect,
            incidental, or consequential damages arising from the use of our website or products.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            8. Changes to These Terms
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We may update these terms from time to time. Continued use of the website after changes
            means you accept the updated terms.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            9. Contact Us
          </h2>
          <p className="text-gray-400 leading-relaxed">
            For questions about these Terms of Service, contact us:
          </p>
          <ul className="space-y-2 text-gray-400 list-disc pl-5 mt-3">
            <li>
              Email:{" "}
              <a href={`mailto:${EMAIL}`} className="text-brand-400 hover:text-brand-300">
                {EMAIL}
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="text-brand-400 hover:text-brand-300">
                {PHONE}
              </a>
            </li>
            <li>Address: Lahore, Punjab, Pakistan</li>
          </ul>
        </article>
      </main>

      <WhatsAppFAB />
    </div>
  );
}
