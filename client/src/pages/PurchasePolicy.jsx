import { STATIC_PAGES, faqEntries, faqSchema } from "../utils/seoData.mjs";
import { Link } from "react-router-dom";
import { CONTACT } from "../utils/contact";
import { POLICY } from "../utils/policies";
import { POLICY_CONTENT } from "../utils/policyContent";
import { SEOHead } from "../utils/seo";

const pages = {
  warranty: { title: "Warranty Policy", sections: [[POLICY.warrantyLabel, POLICY.warranty], ["Warranty Limitations", POLICY.exclusions], ["Warranty Claims", POLICY.claims], [POLICY.asIsLabel, POLICY.asIs]] },
  refund: { title: "Refund Policy", sections: [["No Refunds", POLICY.refunds], ["Returns & Exchanges", POLICY.returns], ["Dead & Non-Working Laptops", POLICY.asIs]] },
  return: { title: "Return Policy", sections: [[POLICY.salesLabel, `${POLICY.refunds} ${POLICY.returns}`], ["Warranty Assessment", POLICY.claims], [POLICY.asIsLabel, POLICY.asIs]] },
  faq: { title: "Frequently Asked Questions", sections: [["Do laptops have a checking warranty?", POLICY.warranty], ["What is excluded from the warranty?", POLICY.exclusions], ["Can I get a refund?", POLICY.refunds], ["Can I return or exchange a product?", POLICY.returns], ["Are dead or faulty laptops covered?", POLICY.asIs], ["How do I make a warranty claim?", POLICY.claims]] },
};

function PolicyText({ content }) {
  return content.split(/\n\n/).map((block, index) => {
    const lines = block.split("\n");
    const heading = lines[0].match(/^(#{2,3}) (.+)$/);
    if (heading) {
      const Heading = heading[1].length === 3 ? "h3" : "h2";
      return <div key={index} className="mb-6"><Heading className="text-xl font-bold text-content font-heading mb-4">{heading[2]}</Heading>{lines.length > 1 && <PolicyText content={lines.slice(1).join("\n")} />}</div>;
    }
    const listStart = lines.findIndex(line => /^(?:- |\d+\. )/.test(line));
    if (listStart >= 0) {
      const ordered = /^\d+\. /.test(lines[listStart]);
      const List = ordered ? "ol" : "ul";
      return <div key={index} className="mb-6">{listStart > 0 && <p className="text-muted leading-relaxed mb-3">{lines.slice(0, listStart).join(" ")}</p>}<List className={`${ordered ? "list-decimal" : "list-disc"} pl-6 space-y-2 text-muted leading-relaxed`}>{lines.slice(listStart).map((line, item) => <li key={item}>{line.replace(/^(?:- |\d+\. )/, "")}</li>)}</List></div>;
    }
    return <p key={index} className="text-muted leading-relaxed mb-6">{block}</p>;
  });
}

export default function PurchasePolicy({ page }) {
  const { title } = pages[page];
  const sections = page === "faq" ? faqEntries : pages[page].sections;
  const path = page === "faq" ? "/faqs" : `/${page}-policy`;
  const meta = STATIC_PAGES[path];
  return <div className="bg-surface min-h-screen">
    <SEOHead title={meta.title} description={meta.description} canonical={path} jsonLd={page === "faq" ? faqSchema() : undefined} />
    <header className="bg-surface-dark border-b border-line">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link to="/" className="text-sm text-muted hover:text-brand-300">Back to Home</Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content font-heading mt-5">{title}</h1>
        <p className="text-sm text-muted mt-3">Last updated: October 21, 2026</p>
      </div>
    </header>
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {page !== "faq" && <>
        <p className="text-muted leading-relaxed mb-6">At ElectroGhar, we aim to provide customers with reliable electronics, transparent product information, and a straightforward shopping experience.</p>
        <p className="text-muted leading-relaxed mb-8">Please read our warranty, refund, and return policies carefully before placing an order. These policies apply to purchases made through the ElectroGhar website and, where applicable, our physical store.</p>
        <h2 className="text-2xl font-bold text-content font-heading mb-6">{POLICY_CONTENT[page].split("\n")[0]}</h2>
        <PolicyText content={POLICY_CONTENT[page].split("\n").slice(2).join("\n")} />
        <h2 className="text-xl font-bold text-content font-heading mb-4">4. Product Condition &amp; Customer Responsibility</h2>
        <PolicyText content={POLICY_CONTENT.common.split("\n").slice(2).join("\n")} />
      </>}
      {page === "faq" && sections.map(([heading, text]) => <section key={heading} className="mb-8">
        <h2 className="text-xl font-bold text-content font-heading mb-4">{heading}</h2>
        <p className="text-muted leading-relaxed">{text}</p>
      </section>)}
      <p className="text-muted leading-relaxed mb-6">{POLICY.rights}</p>
      <p className="text-muted mb-8">For policy questions or warranty claims, <a href={CONTACT.whatsappUrl} className="text-brand-300">contact ElectroGhar on WhatsApp</a> or email <a href={`mailto:${CONTACT.email}`} className="text-brand-300">{CONTACT.email}</a>.</p>
      <nav aria-label="Purchase policies" className="flex flex-wrap gap-4 text-sm text-brand-300">
        <Link to="/warranty-policy">Warranty Policy</Link><Link to="/refund-policy">Refund Policy</Link><Link to="/return-policy">Return Policy</Link><Link to="/faqs">FAQs</Link><Link to="/terms">Terms & Conditions</Link>
      </nav>
    </main>
  </div>;
}
