import { fetchProduct } from "@/lib/api";
import AddToCart from "./widgets/AddToCart";

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const id = Number(params.id);
  const product = await fetchProduct(id);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      <p className="text-slate-700 mb-4">
        ${product.price.toFixed(2)} / {(product as any).unit || "unit"}
      </p>
      <div className="border rounded p-4 max-w-md">
        <AddToCart product={product} />
      </div>
    </section>
  );
}

