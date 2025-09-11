import { fetchProducts } from "@/lib/api";
import Link from "next/link";

type Props = { searchParams?: { q?: string } };

export default async function ProductsPage({ searchParams }: Props) {
  const products = await fetchProducts();
  const q = (searchParams?.q || "").toLowerCase().trim();
  const filtered = q
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q) || String((p as any).unit || "").toLowerCase().includes(q)
      )
    : products;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <form method="get" className="mb-4 flex items-center gap-2">
        <input
          className="border rounded px-2 py-1"
          type="search"
          name="q"
          placeholder="Search products..."
          defaultValue={q}
        />
        <button className="px-3 py-1 rounded bg-slate-700 text-white">Search</button>
      </form>
      {filtered.length === 0 ? (
        <p className="text-slate-600">No products available yet.</p>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((p) => (
            <li key={p.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  <Link href={`/products/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </div>
                <div className="text-slate-600 text-sm">ID: {p.id}</div>
              </div>
              <div className="flex items-center gap-3">
                {(p as any).image_url ? (
                  <img src={(p as any).image_url} alt={p.name} className="h-10 w-10 object-cover rounded border" />
                ) : null}
                <div className="font-semibold">${p.price.toFixed(2)} / {(p as any).unit || "unit"}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
