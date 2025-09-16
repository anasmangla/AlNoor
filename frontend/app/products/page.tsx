import { fetchProducts } from '@/lib/api';
import Link from 'next/link';

type Props = { searchParams?: { q?: string } };

export const metadata = {
  title: 'Products | Al Noor Farm',
  description: 'Browse fresh products at Al Noor Farm.',
  robots: { index: true, follow: true },
};

export default async function ProductsPage({ searchParams }: Props) {
  const products = await fetchProducts();
  const q = (searchParams?.q || '').toLowerCase().trim();
  const placeholderClass =
    'w-full h-40 bg-slate-100 flex items-center justify-center text-slate-400';
  const filtered = q
    ? products.filter((p) => {
        const detail = p as any;
        const unit = String(detail.unit || '').toLowerCase();
        const desc = String(detail.description || '').toLowerCase();
        const cut = String(detail.cut_type || '').toLowerCase();
        const origin = String(detail.origin || '').toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          unit.includes(q) ||
          desc.includes(q) ||
          cut.includes(q) ||
          origin.includes(q)
        );
      })
    : products;
  const site = process.env.NEXT_PUBLIC_SITE_URL || '';
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || '';

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
            const detail = p as any;
            const desc = detail.description || '';
            const short = desc.length > 80 ? desc.slice(0, 77) + '...' : desc;
            const weight = Number(detail.weight ?? 0);
            const pricePerUnit = Number(detail.price_per_unit ?? 0);
            const cut = String(detail.cut_type || '');
            const origin = String(detail.origin || '');
            const mediaUrl = String(detail.image_url || '');
            const isVideo = /\.(mp4|webm)$/i.test(mediaUrl);
            const isYouTube =
              mediaUrl.includes('youtube.com/watch') || mediaUrl.includes('youtu.be/');
            const youtubeId = isYouTube
              ? mediaUrl.includes('watch?v=')
                ? mediaUrl.split('watch?v=')[1]?.split('&')[0] || ''
                : mediaUrl.split('youtu.be/')[1]?.split('?')[0] || ''
              : '';
            const thumb =
              isYouTube && youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                : mediaUrl;
            const showDetail = weight > 0 || pricePerUnit > 0 || cut || origin;
            return (
              <li key={p.id} className="border rounded overflow-hidden hover:shadow">
                <Link href={`/products/${p.id}`} className="block">
                  {thumb ? (
                    isVideo ? (
                      <video
                        className="w-full h-40 object-cover"
                        src={mediaUrl}
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img src={thumb} alt={p.name} className="w-full h-40 object-cover" />
                    )
                  ) : (
                    <div className={placeholderClass}>No Image</div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-slate-600 text-xs">ID: {p.id}</div>
                      </div>
                      <div className="font-semibold text-right">
                        ${p.price.toFixed(2)}
                        <div className="text-xs text-slate-500">{detail.unit || 'unit'}</div>
                      </div>
                    </div>
                    {short && <div className="text-xs text-slate-600 mt-2">{short}</div>}
                    {showDetail && (
                      <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {weight > 0 && (
                          <span>
                            Weight: {weight.toFixed(2)} {detail.unit || ''}
                          </span>
                        )}
                        {pricePerUnit > 0 && <span>Price/unit: ${pricePerUnit.toFixed(2)}</span>}
                        {cut && <span>Cut: {cut}</span>}
                        {origin && <span>Origin: {origin}</span>}
                      </div>
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
