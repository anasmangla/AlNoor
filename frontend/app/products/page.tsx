import { fetchProducts } from "@/lib/api";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await fetchProducts();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      {products.length === 0 ? (
        <p className="text-slate-600">No products available yet.</p>
      ) : (
        <ul className="grid gap-3">
          {products.map((p) => (
            <li key={p.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  <Link href={`/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </div>
                <div className="text-slate-600 text-sm">ID: {p.id}</div>
              </div>
              <div className="font-semibold">${p.price.toFixed(2)} / {(p as any).unit || "unit"}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
