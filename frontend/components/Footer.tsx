const address = "4028 Dickersonville Rd, Ransomville NY 14131";
const email = "info@alnoorfarm716.com";
const hours = "Mon-Sat 9:00am-6:00pm";
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
const footerInnerClasses = [
  "max-w-5xl mx-auto px-6 py-4",
  "text-sm text-slate-600 flex flex-col gap-2",
  "sm:flex-row sm:items-center sm:justify-between",
].join(" ");

export default function Footer() {
  return (
    <footer className="border-t mt-8 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8 grid gap-6 lg:grid-cols-[1.1fr_minmax(0,1fr)]">
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Visit Al Noor Farm</h2>
            <p className="mt-1 leading-relaxed">
              <span className="block">{address}</span>
              <a
                className="text-emerald-700 hover:underline"
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener"
              >
                View on Google Maps
              </a>
            </p>
          </div>
          <div className="leading-relaxed">
            <p>
              Phone:{" "}
              <a className="hover:underline" href="tel:+17165241717">
                716-524-1717
              </a>
              {" "}(calls)
            </p>
            <p>
              <a
                className="hover:underline"
                href="https://wa.me/17165241717"
                target="_blank"
                rel="noopener"
              >
                WhatsApp chat
              </a>
            </p>
            <p>
              Email:{" "}
              <a className="hover:underline" href={`mailto:${email}`}>
                {email}
              </a>
            </p>
          </div>
          <p className="leading-relaxed">Hours: {hours}</p>
        </div>
        <div className="border rounded overflow-hidden h-48">
          <iframe
            title="Al Noor Farm Location"
            src={mapSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
      <div className="border-t bg-white">
        <div className={footerInnerClasses}>
          <div>© {new Date().getFullYear()} Al Noor Farm</div>
          <div className="flex items-center gap-3 flex-wrap">
            <a className="hover:underline" href="/products">Store</a>
            <span className="hidden sm:inline">•</span>
            <a className="hover:underline" href="/admin/login">Admin</a>
            <span className="hidden sm:inline">•</span>
            <a
              className="hover:underline"
              href="https://www.facebook.com/profile.php?id=100093040494987"
              target="_blank"
              rel="noopener"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

