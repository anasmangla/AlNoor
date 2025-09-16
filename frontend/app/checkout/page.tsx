"use client";
import { useState } from "react";
import { createOrder } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SquareCard from "@/components/payments/SquareCard";
import { useLanguage } from "@/context/LanguageContext";

export default function CheckoutPage() {
  const { lines, clear, total } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useLanguage();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError(t("checkout.errors.emptyCart"));
      return;
    }
    setLoading(true);
    try {
      const order = await createOrder({
        customer_name: name || undefined,
        customer_email: email || undefined,
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
        source: "web",
      });
      clear();
      router.push(`/confirmation?orderId=${order.id}`);
    } catch (e: any) {
      setError(e?.message || t("checkout.errors.orderFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">{t("checkout.title")}</h1>
      {lines.length > 0 && (
        <div className="mb-3 text-sm text-slate-700">
          {t("checkout.summary", { count: lines.length, total: total.toFixed(2) })}
        </div>
      )}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-3 max-w-md">
        <div>
          <label className="block text-sm text-slate-600">{t("checkout.nameLabel")}</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("checkout.namePlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">{t("checkout.emailLabel")}</label>
          <input
            type="email"
            className="border rounded px-2 py-1 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("checkout.emailPlaceholder")}
          />
        </div>
        <div className="text-sm text-slate-600">{t("checkout.instructions")}</div>
        {typeof window !== "undefined" && process.env.NEXT_PUBLIC_SQUARE_APP_ID ? (
          <SquareCard
            amountCents={Math.round(total * 100)}
            disabled={loading || lines.length === 0}
            onToken={async (token) => {
              setLoading(true);
              setError(null);
              try {
                const order = await createOrder({
                  customer_name: name || undefined,
                  customer_email: email || undefined,
                  items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
                  source: "web",
                  payment_token: token,
                });
                clear();
                router.push(`/confirmation?orderId=${order.id}`);
              } catch (e: any) {
                setError(e?.message || t("checkout.errors.paymentFailed"));
              } finally {
                setLoading(false);
              }
            }}
          />
        ) : null}
        <button
          type="submit"
          className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-800"
          disabled={loading}
        >
          {loading ? t("checkout.submitLoading") : t("checkout.submit")}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-2">{t("checkout.squareInfo")}</p>
    </section>
  );
}
