import { STATIC_PAGES, faqEntries, faqSchema } from "../utils/seoData.mjs";
import { Link } from "react-router-dom";
import { CONTACT } from "../utils/contact";
import { POLICY } from "../utils/policies";
import { SEOHead } from "../utils/seo";

const pages = {
  warranty: { title: "Warranty Policy", sections: [[POLICY.warrantyLabel, POLICY.warranty], ["Warranty Limitations", POLICY.exclusions], ["Warranty Claims", POLICY.claims], [POLICY.asIsLabel, POLICY.asIs]] },
  refund: { title: "Refund Policy", sections: [["No Refunds", POLICY.refunds], ["Returns & Exchanges", POLICY.returns], ["Dead & Non-Working Laptops", POLICY.asIs]] },
  return: { title: "Return Policy", sections: [[POLICY.salesLabel, `${POLICY.refunds} ${POLICY.returns}`], ["Warranty Assessment", POLICY.claims], [POLICY.asIsLabel, POLICY.asIs]] },
  faq: { title: "Frequently Asked Questions", sections: [["Do laptops have a checking warranty?", POLICY.warranty], ["What is excluded from the warranty?", POLICY.exclusions], ["Can I get a refund?", POLICY.refunds], ["Can I return or exchange a product?", POLICY.returns], ["Are dead or faulty laptops covered?", POLICY.asIs], ["How do I make a warranty claim?", POLICY.claims]] },
};

export default function PurchasePolicy({ page }) {
  const { title } = pages[page];
  const sections = page === "faq" ? faqEntries : pages[page].sections;
  const path = page === "faq" ? "/faqs" : `/${page}-policy`;
  const meta = STATIC_PAGES[path];
  return <div className="bg-surface-alt min-h-screen">
    <SEOHead title={meta.title} description={meta.description} canonical={path} jsonLd={page === "faq" ? faqSchema() : undefined} />
    <header className="bg-surface-dark border-b border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link to="/" className="text-sm text-gray-400 hover:text-brand-400">Back to Home</Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mt-5">{title}</h1>
        <p className="text-sm text-gray-500 mt-3">Last updated: October 20, 2026</p>
      </div>
    </header>
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {sections.map(([heading, text]) => <section key={heading} className="mb-8">
        <h2 className="text-xl font-bold text-white font-heading mb-4">{heading}</h2>
        <p className="text-gray-400 leading-relaxed">{text}</p>
      </section>)}
      <p className="text-gray-300 leading-relaxed mb-6">{POLICY.rights}</p>
      <p className="text-gray-400 mb-8">For policy questions or warranty claims, <a href={CONTACT.whatsappUrl} className="text-brand-400">contact ElectroGhar on WhatsApp</a> or email <a href="mailto:hello@electroghar.pk" className="text-brand-400">hello@electroghar.pk</a>.</p>
      <nav aria-label="Purchase policies" className="flex flex-wrap gap-4 text-sm text-brand-400">
        <Link to="/warranty-policy">Warranty Policy</Link><Link to="/refund-policy">Refund Policy</Link><Link to="/return-policy">Return Policy</Link><Link to="/faqs">FAQs</Link><Link to="/terms">Terms & Conditions</Link>
      </nav>
    </main>
  </div>;
}
