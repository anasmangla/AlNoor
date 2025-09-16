"use client";
import { useState } from "react";
import { createOrder } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import SquareCard from "@/components/payments/SquareCard";

export default function CheckoutPage() {
  const { lines, clear, total } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (lines.length === 0) throw new Error("Cart is empty");
      const order = await createOrder({
        customer_name: name || undefined,
        customer_email: email || undefined,
        items: lines.map((l) => ({ product_id: l.product.id, quantity: l.quantity })),
        source: "web",
      });
      clear();
      router.push(`/confirmation?orderId=${order.id}`);
    } catch (e: any) {
      setError(e.message || "Order failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">Checkout</h1>
      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
        <div className="flex items-center gap-3 text-emerald-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-6 6.732V16a1 1 0 1 1 2 0v-.268a1.75 1.75 0 1 0-2 0ZM14 9h-4V7a2 2 0 1 1 4 0Z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">Secure HTTPS checkout</p>
            <p className="text-sm text-emerald-900">
              Your details are encrypted end-to-end and payments are processed safely via Square.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-800">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 shadow-sm">
            <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2Z" />
            </svg>
            Square Secure
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
            SSL Protected
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
            Visa & Mastercard Ready
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
            Contactless Support
          </span>
        </div>
      </div>
      {lines.length > 0 && (
        <div className="mb-3 text-sm text-slate-700">Items: {lines.length} • Total ${total.toFixed(2)}</div>
      )}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-3 max-w-md">
        <div>
          <label className="block text-sm text-slate-600">Name</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input
            type="email"
            className="border rounded px-2 py-1 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="text-sm text-slate-600">Pay with Square (sandbox) or place a simulated order.</div>
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
                setError(e.message || "Payment failed");
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
          {loading ? "Placing order..." : "Place Order (simulate)"}
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
