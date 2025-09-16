
import CommunityHighlights from "@/components/contact/CommunityHighlights";
import ContactForm from "@/components/contact/ContactForm";
import ReviewsSection from "@/components/contact/ReviewsSection";

export const metadata = {
    title: "Contact | Al Noor Farm",
    description: "Contact Al Noor Farm: address, phone, WhatsApp, and contact form.",
    robots: { index: true, follow: true },
};

export default function ContactPage() {
  const address = "4028 Dickersonville Rd, Ransomville NY 14131";
  const email = "info@alnoorfarm716.com";
  const phone = "716-524-1717";
  const phoneHref = "tel:+17165241717";
  const whatsappLink = "https://wa.me/17165241717";
  const hours = "Mon-Sat 9:00am-6:00pm";
  const googleMapsLink = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
  const mapSrc = `${googleMapsLink}&output=embed`;
  return (
    <section className="grid gap-6">
      <h1 className="heading text-3xl sm:text-4xl">Contact</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Al Noor Farm',
            url: process.env.NEXT_PUBLIC_SITE_URL || undefined,
            address: address,
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: '+17165241717',
                contactType: 'customer service',
                email,
                areaServed: 'US',
                availableLanguage: ['English'],
              },
            ],
            openingHours: ['Mo-Sa 09:00-18:00'],
          }),
        }}
      />
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

            <h2 className="font-heading text-brand text-xl mb-2">Address</h2>
            <p className="text-brand/80">{address}</p>
            <a className="text-brand hover:text-brand-dark hover:underline text-sm" href={`https://maps.google.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noopener">Open in Google Maps</a>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-heading text-brand text-xl mb-2">Phone</h2>
            <p className="text-brand/80">
              <a className="text-brand hover:text-brand-dark hover:underline" href="tel:+17165241717">716-524-1717</a> (calls) •
              <a className="text-brand hover:text-brand-dark hover:underline ml-1" href="https://wa.me/17165241717" target="_blank" rel="noopener">WhatsApp</a>
            </p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-heading text-brand text-xl mb-2">Facebook</h2>
            <a className="text-brand hover:text-brand-dark hover:underline" href="https://www.facebook.com/profile.php?id=100093040494987" target="_blank" rel="noopener">Follow us on Facebook</a>
          </div>
        </div>
      </div>

      <FAQSection />

      <div className="border rounded p-4 max-w-xl">
        <h2 className="font-heading text-brand text-xl mb-3">Send a message</h2>
        <ContactForm />
      </div>
    </section>
  );
}

            <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                <ReviewsSection />
                <CommunityHighlights />
            </div>
        </section>
    );
}
