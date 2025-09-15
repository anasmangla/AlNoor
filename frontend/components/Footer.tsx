export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-brand/80 grid gap-2 sm:flex sm:items-center sm:justify-between">
        <div>
          © {new Date().getFullYear()} <span className="font-heading text-brand">Al Noor Farm</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <a className="text-brand hover:text-brand-dark hover:underline" href="/products">Store</a>
          <span className="hidden sm:inline">•</span>
          <a className="text-brand hover:text-brand-dark hover:underline" href="/admin/login">Admin</a>
          <span className="hidden sm:inline">•</span>
          <a className="text-brand hover:text-brand-dark hover:underline" href="tel:+17165241717">Call 716-524-1717</a>
          <span className="hidden sm:inline">•</span>
          <a className="text-brand hover:text-brand-dark hover:underline" href="https://wa.me/17165241717" target="_blank" rel="noopener">WhatsApp</a>
          <span className="hidden sm:inline">•</span>
          <a className="text-brand hover:text-brand-dark hover:underline" href="https://www.facebook.com/profile.php?id=100093040494987" target="_blank" rel="noopener">Facebook</a>
        </div>
      </div>
    </footer>
  );
}

