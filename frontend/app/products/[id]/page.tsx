import { fetchProduct } from "@/lib/api";
import AddToCart from "./widgets/AddToCart";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const id = Number(params.id);
  const product = await fetchProduct(id);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const url = `${site}${bp}/products/${id}`;

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      { (product as any).image_url ? (
        <img src={(product as any).image_url} alt={product.name} className="mb-3 max-h-64 rounded border" />
      ) : null}
      <p className="text-slate-700 mb-4">
        ${product.price.toFixed(2)} / {(product as any).unit || "unit"}
      </p>
      {(product as any).description && (
        <p className="text-slate-600 mb-4 whitespace-pre-line">{(product as any).description}</p>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: (product as any).description || undefined,
            image: (product as any).image_url || undefined,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: product.price,
              url,
              availability: 'https://schema.org/InStock',
            },
            url,
          }),
        }}
      />
      <div className="border rounded p-4 max-w-md">
        <AddToCart product={product} />
      </div>
    </section>
  );
} 
