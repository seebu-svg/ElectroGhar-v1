import { Phone } from "lucide-react";

export default function WhatsAppFAB() {
  return (
    <a
      href="https://wa.me/923001234567?text=Hi%20ElectroGhar!%20I%20have%20a%20question."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 hover:scale-110 transition-all duration-200"
    >
      <Phone className="w-6 h-6" />
    </a>
  );
}
