"use client";
import { useState } from "react";
import { createOrder } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SquareCard from "@/components/payments/SquareCard";
import { getWeightPricing } from "@/lib/weight";

type FulfillmentMethod = "pickup" | "delivery";

export default function CheckoutPage() {
  const { lines, clear, total } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const hasItems = lines.length > 0;

  async function placeOrder(extra?: { payment_token?: string }) {
    if (lines.length === 0) throw new Error("Cart is empty");
    return await createOrder({
      customer_name: name || undefined,
      customer_email: email || undefined,
      items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
      source: "web",
      fulfillment_method: fulfillmentMethod,
      ...extra,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (lines.length === 0) {
      setError(t("checkout.errors.emptyCart"));
      return;
    }
    setLoading(true);
    try {
      const order = await placeOrder();
      clear();
      router.push(`/confirmation?orderId=${order.id}`);
    } catch (e: any) {
      setError(e?.message || t("checkout.errors.orderFailed"));
    } finally {
      setLoading(false);
    }
  }

  const showSquare =
    typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SQUARE_APP_ID);

  return (
    <section className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
        <p className="text-sm text-slate-600">
          Complete your purchase as a guest—no account or password required.
        </p>
      </div>
      {error && (
        <div
          className="text-red-700 bg-red-50 border border-red-200 p-2 rounded"
          role="alert"
        >
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
                trackPurchase(order);
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
          className="w-full rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-800 sm:w-auto"
          disabled={loading}
        >
          {loading ? t("checkout.submitLoading") : t("checkout.submit")}
        </button>
      </form>
      <p className="text-xs text-slate-500 mt-2">If Square is configured (sandbox), payment will be processed; otherwise, the order is simulated.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Return &amp; Refund Policy</h2>
          <p className="mt-2 text-sm text-slate-600">
            We stand behind every delivery. If an item arrives damaged or below our freshness standards,
            contact us within 48 hours for a no-hassle replacement or refund.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Keep your receipt or confirmation email for quick support.</li>
            <li>Unopened pantry goods can be returned within 7 days of purchase.</li>
            <li>Refunds are issued to the original payment method within 3–5 business days.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Farm-Fresh Hygiene Practices</h2>
          <p className="mt-2 text-sm text-slate-600">
            Our team follows strict hygiene protocols from pasture to packaging so your order arrives safe and wholesome.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
            <li>Daily sanitation of equipment, cold storage, and delivery crates.</li>
            <li>Milk and dairy sealed immediately after pasteurization with tamper-evident caps.</li>
            <li>Delivery coolers are temperature checked before every route.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
