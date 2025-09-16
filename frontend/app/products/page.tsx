import { fetchProducts } from "@/lib/api";
import type { Product } from "@/lib/api";
import Link from "next/link";

type Props = { searchParams?: { q?: string } };

export const metadata = {
  title: "Products | Al Noor Farm",
  description: "Browse fresh products at Al Noor Farm.",
  robots: { index: true, follow: true },
};

export default async function ProductsPage({ searchParams }: Props) {
  const products = await fetchProducts();
  const q = (searchParams?.q || "").toLowerCase().trim();
  const filtered = q
    ? products.filter((p) =>
        p.name.toLowerCase().includes(q) || String((p as any).unit || "").toLowerCase().includes(q)
      )
    : products;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const badgeBase = "inline-flex items-center px-2 py-0.5 rounded-full font-medium";
  const badgeStyles: Record<Product["stock_status"], string> = {
    in_stock: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    low_stock: "bg-amber-100 text-amber-800 border border-amber-200",
    out_of_stock: "bg-red-100 text-red-800 border border-red-200",
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}${bp}/` },
              { '@type': 'ListItem', position: 2, name: 'Products', item: `${site}${bp}/products` },
            ],
          }),
        }}
      />
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
            const stockAmount = Number((p as any).stock ?? 0);
            const stockDisplay = `${stockAmount.toLocaleString(undefined, {
              maximumFractionDigits: p.is_weight_based ? 2 : 0,
            })} ${(p as any).unit || ""}`.trim();
            const badgeClass = `${badgeBase} ${badgeStyles[p.stock_status]}`;
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
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className={badgeClass}>
                        {p.stock_status_label}
                      </span>
                      <span className="text-slate-500">
                        {p.backorder_available ? "Backorder" : stockDisplay || ""}
                      </span>
                    </div>
                    {p.backorder_available && (
                      <div className="text-xs text-amber-700 mt-2">
                        Reserve now—leave your email on the product page.
                      </div>
                    )}
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
