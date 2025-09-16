import LocalizedText from "@/components/LocalizedText";

export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-slate-600 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} Al Noor Farm</div>
        <div className="flex items-center gap-3 flex-wrap">
          <a className="hover:underline" href="/products">
            <LocalizedText id="footer.store" />
          </a>
          <span className="hidden sm:inline">•</span>
          <a className="hover:underline" href="/admin/login">
            <LocalizedText id="footer.admin" />
          </a>
          <span className="hidden sm:inline">•</span>
          <a className="hover:underline" href="tel:+17165241717">
            <LocalizedText id="footer.call" values={{ phone: "716-524-1717" }} />
          </a>
          <span className="hidden sm:inline">•</span>
          <a className="hover:underline" href="https://wa.me/17165241717" target="_blank" rel="noopener">
            <LocalizedText id="footer.whatsapp" />
          </a>
          <span className="hidden sm:inline">•</span>
          <a
            className="hover:underline"
            href="https://www.facebook.com/profile.php?id=100093040494987"
            target="_blank"
            rel="noopener"
          >
            <LocalizedText id="footer.facebook" />
          </a>
        </div>
      </div>
    </footer>
  );
}

