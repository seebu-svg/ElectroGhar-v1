import { STATIC_PAGES } from "../utils/seoData.mjs";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import WhatsAppFAB from "../components/ui/WhatsAppFAB";
import { CONTACT } from "../utils/contact";
import { SEOHead, organizationSchema } from "../utils/seo";

export default function Contact() {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://electroghar.pk";

  return (
    <div className="bg-surface">
      <SEOHead
        title={STATIC_PAGES["/contact"].title}
        description={STATIC_PAGES["/contact"].description}
        canonical={`${origin}/contact`}
        jsonLd={organizationSchema()}
      />
      <section className="relative bg-surface-dark border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="text-brand-400 font-semibold mb-4">Visit us in Karachi</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading mb-5">Contact ElectroGhar</h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Need help choosing your next device? Call, message us on WhatsApp, or visit our shop for advice and the latest prices.
          </p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-surface-dark p-6 sm:p-8">
            <MapPin className="w-6 h-6 text-brand-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-3">Our shop</h2>
            <address className="not-italic text-gray-300 leading-relaxed">{CONTACT.address}</address>
            <div className="flex items-start gap-3 mt-6 text-gray-300">
              <Clock className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <p>{CONTACT.hours}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface-dark p-6 sm:p-8">
            <Phone className="w-6 h-6 text-brand-400 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-3">Talk to us</h2>
            <a href={CONTACT.callUrl} className="text-lg text-brand-400 hover:text-brand-300">{CONTACT.phone}</a>
            <div className="flex flex-col gap-3 mt-6">
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-3 font-semibold text-white transition-colors">
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </a>
              <a href={CONTACT.callUrl} className="inline-flex justify-center items-center gap-2 rounded-xl border border-white/15 hover:border-brand-400 px-5 py-3 font-semibold text-white transition-colors">
                <Phone className="w-5 h-5" /> Call us
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-2xl border border-white/10 overflow-hidden">
          <iframe title="Find ElectroGhar at Naaz Digital Plaza, Karachi" src={`https://www.google.com/maps?q=${encodeURIComponent(`ElectroGhar, ${CONTACT.address}`)}&output=embed`} width="100%" height="350" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="border-0" />
        </div>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`ElectroGhar, ${CONTACT.address}`)}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-brand-400">Open directions in Google Maps</a>
      </section>
      <WhatsAppFAB />
    </div>
  );
}
