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
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const desc = (p as any).description || "";
            const short = desc.length > 80 ? desc.slice(0, 77) + "..." : desc;
            return (
              <li key={p.id} className="border rounded overflow-hidden hover:shadow">
                <Link href={`/products/${p.id}`} className="block">
                  {(p as any).image_url ? (
                    <img src={(p as any).image_url} alt={p.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-slate-600 text-xs">ID: {p.id}</div>
                      </div>
                      <div className="font-semibold text-right">${p.price.toFixed(2)}<div className="text-xs text-slate-500">{(p as any).unit || "unit"}</div></div>
                    </div>
                    {short && (
                      <div className="text-xs text-slate-600 mt-2">{short}</div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
