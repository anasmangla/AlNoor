export default function Home() {
  return (
    <div className="text-center">
      <img
        src="/alnoorlogo.png"
        alt="Al Noor Farm Logo"
        className="mx-auto mb-6 max-h-28"
      />
      <h1 className="text-3xl font-semibold mb-2">Al Noor Farm</h1>
      <p className="text-slate-600 mb-6">
        Browse products, manage inventory, and run POS.
      </p>
      <div className="flex gap-4 justify-center">
        <a className="text-blue-600 hover:underline" href="/products">Store</a>
        <a className="text-blue-600 hover:underline" href="/admin/login">Admin</a>
        <a className="text-blue-600 hover:underline" href="/admin/pos">POS</a>
      </div>
    </div>
  );
}
