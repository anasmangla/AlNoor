export const metadata = {
  title: "Contact | Al Noor Farm",
  description: "Contact Al Noor Farm: address, phone, WhatsApp, and contact form.",
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const address = "4028 Dickersonville Rd, Ransomville NY 14131";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border rounded overflow-hidden">
          <iframe
            title="Al Noor Farm Location"
            src={mapSrc}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="grid gap-3">
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Address</h2>
            <p className="text-slate-700">{address}</p>
            <a className="text-blue-700 hover:underline text-sm" href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener">Open in Google Maps</a>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Phone</h2>
            <p className="text-slate-700">
              <a className="hover:underline" href="tel:+17165241717">716-524-1717</a> (calls) •
              <a className="hover:underline ml-1" href="https://wa.me/17165241717" target="_blank" rel="noopener">WhatsApp</a>
            </p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-medium mb-2">Facebook</h2>
            <a className="text-blue-700 hover:underline" href="https://www.facebook.com/profile.php?id=100093040494987" target="_blank" rel="noopener">Follow us on Facebook</a>
          </div>
        </div>
      </div>

      <div className="border rounded p-4 max-w-xl">
        <h2 className="font-medium mb-3">Send a message</h2>
        <ContactForm />
      </div>
    </section>
  );
}

// Client form component
import ContactForm from "@/components/contact/ContactForm";
