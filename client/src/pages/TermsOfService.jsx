import { STATIC_PAGES } from "../utils/seoData.mjs";
import { POLICY } from "../utils/policies";
import { CONTACT } from "../utils/contact";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { SEOHead } from "../utils/seo";

const SITE = "ElectroGhar";
const EMAIL = CONTACT.email;
const PHONE = CONTACT.phone;

export default function TermsOfService() {
  return (
    <div className="bg-surface min-h-screen">
      <SEOHead
        title={STATIC_PAGES["/terms"].title}
        description={STATIC_PAGES["/terms"].description}
        canonical={`${typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk"}/terms`}
        type="website"
      />

      <header className="relative bg-surface-dark border-b border-line overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-600/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-9 h-9 rounded-xl bg-brand-600/15 border border-brand-600/30 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-brand-300" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-content font-heading">
              Terms of Service
            </h1>
          </div>
          <p className="text-sm text-muted">Last updated: October 20, 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <article className="prose prose-invert prose-brand max-w-none">
          <p className="text-muted leading-relaxed">
            Welcome to {SITE}. These Terms of Service govern your use of our website and any
            purchase or inquiry made through WhatsApp. By using our services, you agree to these
            terms.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            1. Orders & Pricing
          </h2>
          <ul className="space-y-3 text-muted list-disc pl-5">
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

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            2. Product Condition
          </h2>
          <p className="text-muted leading-relaxed">
            We clearly label every product as New, Used, or Refurbished and provide a condition
            grade (New, Like New, Excellent, Good, Fair). Product descriptions and images represent
            the actual item as closely as possible. Please confirm any specific details on WhatsApp
            before purchasing.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            3. Payment & Delivery
          </h2>
          <ul className="space-y-3 text-muted list-disc pl-5">
            <li>Payment methods and delivery options are arranged via WhatsApp after confirmation.</li>
            <li>
              Delivery timelines depend on your location and courier availability. We are not
              responsible for delays caused by courier services or force majeure events.
            </li>
            <li>
              Risk of loss or damage passes to you once the product is handed over to the courier.
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            4. Returns & Refunds
          </h2>
          <p className="text-muted leading-relaxed">
            {POLICY.refunds} {POLICY.returns}
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            5. Warranty
          </h2>
          <p className="text-muted leading-relaxed">
            {POLICY.warranty} {POLICY.exclusions} {POLICY.claims}
          </p>
          <p className="text-muted leading-relaxed mt-4">
            {POLICY.asIs} {POLICY.rights}
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            6. User Responsibilities
          </h2>
          <ul className="space-y-3 text-muted list-disc pl-5">
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

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            7. Limitation of Liability
          </h2>
          <p className="text-muted leading-relaxed">
            To the maximum extent permitted by law, {SITE} shall not be liable for any indirect,
            incidental, or consequential damages arising from the use of our website or products.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            8. Changes to These Terms
          </h2>
          <p className="text-muted leading-relaxed">
            We may update these terms from time to time. Continued use of the website after changes
            means you accept the updated terms.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-content font-heading mt-10 mb-4">
            9. Contact Us
          </h2>
          <p className="text-muted leading-relaxed">
            For questions about these Terms of Service, contact us:
          </p>
          <ul className="space-y-2 text-muted list-disc pl-5 mt-3">
            <li>
              Email:{" "}
              <a href={`mailto:${EMAIL}`} className="text-brand-300 hover:text-brand-300">
                {EMAIL}
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href={CONTACT.callUrl} className="text-brand-300 hover:text-brand-300">
                {PHONE}
              </a>
            </li>
            <li>Address: {CONTACT.address}</li>
            <li>Hours: {CONTACT.hours}</li>
          </ul>
        </article>
      </main>

      <WhatsAppFAB />
    </div>
  );
}
