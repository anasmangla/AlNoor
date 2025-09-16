"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CartPage() {
  const { lines, update, remove, total } = useCart();
  const { t } = useLanguage();
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">{t("cart.title")}</h1>
      {lines.length === 0 ? (
        <p className="text-slate-600">{t("cart.empty")}</p>
      ) : (
        <>
          <ul className="grid gap-2 mb-4">
            {lines.map((l) => (
              <li key={l.product.id} className="border rounded p-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{l.product.name}</div>
                  <div className="text-sm text-slate-600">
                    ${l.product.price.toFixed(2)} / {(l.product as any).unit || t("products.unitName")}
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
                    {t("cart.remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              {t("cart.total")}: ${total.toFixed(2)}
            </div>
            <Link href="/checkout" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">
              {t("cart.checkout")}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
