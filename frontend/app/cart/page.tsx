"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export const metadata = {
  title: "Cart | Al Noor Farm",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  const { lines, update, remove, total } = useCart();
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Cart</h1>
      {lines.length === 0 ? (
        <p className="text-slate-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="grid gap-2 mb-4">
            {lines.map((l) => (
              <li key={l.product.id} className="border rounded p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-sm text-slate-600">
                    ${l.product.price.toFixed(2)} / {(l.product as any).unit || "unit"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded px-2 py-1 w-24"
                    type="number"
                    min={(l.product as any).is_weight_based ? 0 : 1}
                    step={(l.product as any).is_weight_based ? 0.1 : 1}
                    value={l.quantity}
                    onChange={(e) => update(l.product.id, parseFloat(e.target.value))}
                  />
                  <button onClick={() => remove(l.product.id)} className="text-red-700 hover:underline">
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>
            <Link href="/checkout" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">
              Checkout
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
