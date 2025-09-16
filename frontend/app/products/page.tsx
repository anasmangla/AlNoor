import { fetchProducts } from "@/lib/api";
import LocalizedText from "@/components/LocalizedText";
import ProductsContent from "@/components/products/ProductsContent";

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

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">
        <LocalizedText id="products.title" />
      </h1>
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
      <ProductsContent products={filtered} query={searchParams?.q || ""} />
    </section>
  );
}
