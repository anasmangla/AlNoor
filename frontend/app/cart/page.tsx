"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

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
              <li
                key={l.product.id}
                className="border rounded p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="w-full sm:flex-1">
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-sm text-slate-600">
                    ${l.product.price.toFixed(2)} / {(l.product as any).unit || "unit"}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <input
                    className="border rounded px-2 py-1 w-full sm:w-24"
                    type="number"
                    min={(l.product as any).is_weight_based ? 0 : 1}
                    step={(l.product as any).is_weight_based ? 0.1 : 1}
                    value={l.quantity}
                    onChange={(e) => update(l.product.id, parseFloat(e.target.value))}
                  />
                  <button
                    onClick={() => remove(l.product.id)}
                    className="self-start text-left text-red-700 hover:underline sm:self-auto sm:text-right"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>
            <Link
              href="/checkout"
              className="w-full rounded bg-emerald-600 px-3 py-1 text-center text-white hover:bg-emerald-700 sm:w-auto"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
