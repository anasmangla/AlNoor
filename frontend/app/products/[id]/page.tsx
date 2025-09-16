import { fetchProduct } from "@/lib/api";
import { getWeightPricing } from "@/lib/weight";
import AddToCart from "./widgets/AddToCart";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const id = Number(params.id);
  const product = await fetchProduct(id);
  const detail = product as any;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const url = `${site}${bp}/products/${id}`;
  const weight = getWeightPricing(product);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>

      {(product as any).image_url ? (
        <img
          src={(product as any).image_url}
          alt={product.name}
          className="mb-3 h-auto w-full max-h-64 rounded border object-cover"
        />
      ) : null}
      <div className="text-slate-700 mb-4">
        <div className="text-lg font-semibold">
          ${product.price.toFixed(2)} / {(product as any).unit || "unit"}
        </div>
        {weight && (
          <div className="text-sm text-slate-500">
            ${weight.perLb.toFixed(2)}/lb · ${weight.perKg.toFixed(2)}/kg
          </div>
        )}
      </div>
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
            image: mediaUrl || undefined,
            offers: {
              '@type': 'Offer',
              priceCurrency: 'USD',
              price: product.price,
              url,
              availability: 'https://schema.org/InStock',
              ...(pricePerUnit > 0
                ? {
                    priceSpecification: {
                      '@type': 'UnitPriceSpecification',
                      price: pricePerUnit,
                      priceCurrency: 'USD',
                      unitText: detail.unit || undefined,
                    },
                  }
                : {}),
            },
            ...(showDetail
              ? {
                  additionalProperty: [
                    ...(weight > 0
                      ? [
                          {
                            '@type': 'PropertyValue',
                            name: 'Weight',
                            value: `${weight.toFixed(2)} ${detail.unit || ''}`.trim(),
                          },
                        ]
                      : []),
                    ...(cutType
                      ? [
                          {
                            '@type': 'PropertyValue',
                            name: 'Cut type',
                            value: cutType,
                          },
                        ]
                      : []),
                    ...(origin
                      ? [
                          {
                            '@type': 'PropertyValue',
                            name: 'Origin',
                            value: origin,
                          },
                        ]
                      : []),
                  ],
                }
              : {}),
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
