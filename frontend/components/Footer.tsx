export default function Footer() {
  return (
    <footer className="border-t mt-8">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-slate-600 flex items-center justify-between">
        <div>© {new Date().getFullYear()} Al Noor Farm</div>
        <div>
          <a className="hover:underline" href="/products">Store</a>
          <span className="mx-2">·</span>
          <a className="hover:underline" href="/admin/login">Admin</a>
        </div>
      </div>
    </footer>
  );
}

