import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { SEOHead } from "../utils/seo";

const SITE = "ElectroGhar";
const EMAIL = "hello@electroghar.pk";
const PHONE = "+92 300 1234567";

export default function PrivacyPolicy() {
  return (
    <div className="bg-surface-alt min-h-screen">
      <SEOHead
        title="Privacy Policy"
        description="ElectroGhar's privacy policy explains how we collect, use and protect your personal information when you browse our catalog or message us on WhatsApp."
        canonical={`${typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk"}/privacy`}
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
              <Shield className="w-4.5 h-4.5 text-brand-500" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-gray-500">Last updated: September 2026</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <article className="prose prose-invert prose-brand max-w-none">
          <p className="text-gray-300 leading-relaxed">
            At {SITE}, we respect your privacy. This policy describes what information we collect,
            how we use it, and the choices you have when you visit our website or contact us through
            WhatsApp.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            1. Information We Collect
          </h2>
          <ul className="space-y-3 text-gray-400 list-disc pl-5">
            <li>
              <strong className="text-gray-200">Information you provide:</strong> name, phone
              number, WhatsApp number, delivery address and any other details you share when you
              message us about a product.
            </li>
            <li>
              <strong className="text-gray-200">Automatic data:</strong> browser type, device
              information, pages visited, and approximate location derived from your IP address,
              collected via standard server logs.
            </li>
            <li>
              <strong className="text-gray-200">Cookies:</strong> we use only essential cookies
              required for the website to function. We do not use tracking or advertising cookies.
            </li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            2. How We Use Your Information
          </h2>
          <ul className="space-y-3 text-gray-400 list-disc pl-5">
            <li>To respond to your product inquiries and confirm pricing on WhatsApp.</li>
            <li>To process orders, arrange delivery, and provide after-sales support.</li>
            <li>To improve our catalog, website performance, and customer experience.</li>
            <li>To comply with legal obligations or protect our rights.</li>
          </ul>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            3. How We Share Your Information
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We do not sell or rent your personal information. We may share it only with trusted
            delivery partners when necessary to fulfill your order, or when required by law.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            4. Data Security
          </h2>
          <p className="text-gray-400 leading-relaxed">
            We use industry-standard security practices to protect your information. However, no
            method of transmission over the internet is completely secure, and we cannot guarantee
            absolute security.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            5. Your Rights
          </h2>
          <p className="text-gray-400 leading-relaxed">
            You may ask us to access, correct, or delete the personal information we hold about you.
            To make a request, contact us using the details below.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            6. Third-Party Links
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Our website may contain links to WhatsApp or other third-party services. This policy
            does not apply to those services; please review their privacy policies separately.
          </p>

          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading mt-10 mb-4">
            7. Contact Us
          </h2>
          <p className="text-gray-400 leading-relaxed">
            If you have any questions about this Privacy Policy, please reach out:
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
