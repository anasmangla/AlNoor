export default function NotFound() {
  return (
    <section className="text-center py-16">
      <h1 className="text-3xl font-semibold mb-2">Page Not Found</h1>
      <p className="text-slate-600 mb-4">The page you requested does not exist.</p>
      <a className="text-blue-600 hover:underline" href="/">Go home</a>
    </section>
  );
}

