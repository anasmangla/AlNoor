import { fetchProduct } from "@/lib/api";
import type { Product } from "@/lib/api";
import AddToCart from "./widgets/AddToCart";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const id = Number(params.id);
  const product = await fetchProduct(id);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "";
  const bp = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const url = `${site}${bp}/products/${id}`;
  const badgeBase = "inline-flex items-center px-2 py-0.5 rounded-full font-medium";
  const badgeStyles: Record<Product["stock_status"], string> = {
    in_stock: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    low_stock: "bg-amber-100 text-amber-800 border border-amber-200",
    out_of_stock: "bg-red-100 text-red-800 border border-red-200",
  };
  const stockAmount = Number((product as any).stock ?? 0);
  const stockDisplay = `${stockAmount.toLocaleString(undefined, {
    maximumFractionDigits: product.is_weight_based ? 2 : 0,
  })} ${(product as any).unit || ""}`.trim();
  const availability =
    product.stock_status === "out_of_stock"
      ? product.backorder_available
        ? "https://schema.org/BackOrder"
        : "https://schema.org/OutOfStock"
      : product.stock_status === "low_stock"
      ? "https://schema.org/LimitedAvailability"
      : "https://schema.org/InStock";

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      <div className="flex items-center gap-3 mb-3">
        <span className={`${badgeBase} ${badgeStyles[product.stock_status]}`}>
          {product.stock_status_label}
        </span>
        {product.backorder_available ? (
          <span className="text-sm text-amber-700">
            Currently backordered—reserve below.
          </span>
        ) : (
          <span className="text-sm text-slate-600">
            {stockDisplay || "Available"}
          </span>
        )}
      </div>
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
              availability,
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
