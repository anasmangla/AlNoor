import { fetchProduct } from '@/lib/api';
import AddToCart from './widgets/AddToCart';

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const id = Number(params.id);
  const product = await fetchProduct(id);
  const detail = product as any;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';
  const url = `${site}${bp}/products/${id}`;
  const weight = Number(detail.weight ?? 0);
  const pricePerUnit = Number(detail.price_per_unit ?? 0);
  const cutType = String(detail.cut_type || '');
  const origin = String(detail.origin || '');
  const showDetail = weight > 0 || pricePerUnit > 0 || cutType || origin;
  const mediaUrl = String(detail.image_url || '');
  const isVideo = /\.(mp4|webm)$/i.test(mediaUrl);
  const isYouTube = mediaUrl.includes('youtube.com/watch') || mediaUrl.includes('youtu.be/');
  const iframeAllow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  const embedUrl = isYouTube
    ? mediaUrl.includes('watch?v=')
      ? mediaUrl.replace('watch?v=', 'embed/')
      : mediaUrl.replace('youtu.be/', 'www.youtube.com/embed/')
    : '';

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      {mediaUrl ? (
        isVideo ? (
          <video
            className="mb-3 max-h-64 rounded border"
            controls
            src={mediaUrl}
            preload="metadata"
          />
        ) : isYouTube ? (
          <div className="mb-3 aspect-video w-full max-w-3xl">
            <iframe
              className="h-full w-full rounded border"
              src={embedUrl}
              title={product.name}
              allow={iframeAllow}
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={mediaUrl}
            alt={product.name}
            className="mb-3 max-h-64 w-full max-w-3xl rounded border object-cover"
          />
        )
      ) : null}
      <p className="text-slate-700 mb-4">
        ${product.price.toFixed(2)} / {detail.unit || 'unit'}
      </p>
      {showDetail && (
        <dl className="mb-4 grid gap-2 max-w-md text-sm text-slate-600">
          {weight > 0 && (
            <div className="flex justify-between">
              <dt className="font-medium">Weight</dt>
              <dd>
                {weight.toFixed(2)} {detail.unit || ''}
              </dd>
            </div>
          )}
          {pricePerUnit > 0 && (
            <div className="flex justify-between">
              <dt className="font-medium">Price per unit</dt>
              <dd>${pricePerUnit.toFixed(2)}</dd>
            </div>
          )}
          {cutType && (
            <div className="flex justify-between">
              <dt className="font-medium">Cut</dt>
              <dd>{cutType}</dd>
            </div>
          )}
          {origin && (
            <div className="flex justify-between">
              <dt className="font-medium">Origin</dt>
              <dd>{origin}</dd>
            </div>
          )}
        </dl>
      )}
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
