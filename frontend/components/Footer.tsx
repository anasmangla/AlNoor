const address = "4028 Dickersonville Rd, Ransomville NY 14131";
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="max-w-5xl mx-auto px-6 py-10 text-sm text-slate-600">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="border border-slate-200 rounded-lg p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Visit us</h2>
              <p className="leading-relaxed">{address}</p>
              <a
                className="mt-2 inline-flex text-blue-700 hover:underline"
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener"
              >
                Get directions
              </a>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Call</h2>
              <a className="hover:underline" href="tel:+17165241717">
                716-524-1717
              </a>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Email</h2>
              <a className="hover:underline" href="mailto:info@alnoorfarm716.com">
                info@alnoorfarm716.com
              </a>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Connect</h2>
              <div className="flex flex-col gap-1">
                <a
                  className="hover:underline"
                  href="https://wa.me/17165241717"
                  target="_blank"
                  rel="noopener"
                >
                  WhatsApp
                </a>
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
          <div className="border border-slate-200 rounded-lg overflow-hidden min-h-[220px]">
            <iframe
              title="Al Noor Farm Location"
              src={mapSrc}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Al Noor Farm</div>
          <div className="flex items-center gap-3 flex-wrap">
            <a className="hover:underline" href="/products">
              Store
            </a>
            <span className="hidden sm:inline text-slate-300" aria-hidden="true">
              •
            </span>
            <a className="hover:underline" href="/admin/login">
              Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
