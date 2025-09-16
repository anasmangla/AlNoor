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
    setLoading(true);
    try {
      const order = await placeOrder();
      clear();
      router.push(`/confirmation?orderId=${order.id}`);
    } catch (e: any) {
      setError(e.message || "Order failed");
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="border rounded p-4 bg-white shadow-sm shadow-slate-100">
            <h2 className="text-lg font-semibold mb-1">Guest details</h2>
            <p className="text-sm text-slate-600 mb-3">
              Share contact info if you would like updates about your order. Otherwise, leave
              these fields blank and continue as a guest.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm text-slate-600 mb-1"
                  htmlFor="checkoutName"
                >
                  Name (optional)
                </label>
                <input
                  id="checkoutName"
                  className="border rounded px-2 py-1 w-full"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  className="block text-sm text-slate-600 mb-1"
                  htmlFor="checkoutEmail"
                >
                  Email (optional)
                </label>
                <input
                  id="checkoutEmail"
                  type="email"
                  className="border rounded px-2 py-1 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>
          </div>
          <div className="border rounded p-4 bg-white shadow-sm shadow-slate-100">
            <h2 className="text-lg font-semibold mb-1">Fulfillment</h2>
            <p className="text-sm text-slate-600">
              Choose how you would like to receive your order.
            </p>
            <div className="mt-3 grid gap-3">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="fulfillment"
                  value="pickup"
                  className="mt-1"
                  checked={fulfillmentMethod === "pickup"}
                  onChange={() => setFulfillmentMethod("pickup")}
                />
                <span>
                  <span className="font-medium block">Farm pickup</span>
                  <span className="text-sm text-slate-600">
                    Free pickup during regular farm hours. We will have everything ready when
                    you arrive.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="fulfillment"
                  value="delivery"
                  className="mt-1"
                  checked={fulfillmentMethod === "delivery"}
                  onChange={() => setFulfillmentMethod("delivery")}
                />
                <span>
                  <span className="font-medium block">Local delivery</span>
                  <span className="text-sm text-slate-600">
                    Delivery within our local service area. We will coordinate the drop-off
                    time after checkout.
                  </span>
                </span>
              </label>
            </div>
          </div>
          <div className="border rounded p-4 bg-white shadow-sm shadow-slate-100 grid gap-3">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm text-slate-600">
              Pay instantly with Square (sandbox) or place a quick guest order now.
            </p>
            {showSquare ? (
              <SquareCard
                amountCents={Math.round(total * 100)}
                disabled={loading || !hasItems}
                onToken={async (token) => {
                  setLoading(true);
                  setError(null);
                  try {
                    const order = await placeOrder({ payment_token: token });
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
              className="bg-slate-700 text-white px-3 py-2 rounded hover:bg-slate-800 disabled:opacity-60"
              disabled={loading || !hasItems}
            >
              {loading ? "Placing order..." : "Complete Order as Guest"}
            </button>
            <p className="text-xs text-slate-500">
              If Square is configured (sandbox), payment will be processed; otherwise, the
              order is simulated for testing.
            </p>
          </div>
        </form>
        <aside className="border rounded p-4 bg-slate-50 self-start">
          <h2 className="text-lg font-semibold mb-3">Order summary</h2>
          {hasItems ? (
            <ul className="grid gap-3">
              {lines.map((line) => {
                const weight = getWeightPricing(line.product);
                const unit = line.product.unit || "unit";
                return (
                  <li
                    key={line.product.id}
                    className="border-b border-slate-200 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                      <span>{line.product.name}</span>
                      <span>${(line.product.price * line.quantity).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      {line.product.is_weight_based
                        ? `Weight: ${line.quantity} ${unit}`
                        : `Qty: ${line.quantity}`}
                      {` @ $${line.product.price.toFixed(2)}`}
                      {line.product.is_weight_based ? `/${unit}` : ""}
                    </div>
                    {weight && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        ${weight.perLb.toFixed(2)}/lb · ${weight.perKg.toFixed(2)}/kg
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-600">Your cart is empty. Add items to begin checkout.</p>
          )}
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {fulfillmentMethod === "delivery"
              ? "Delivery orders are coordinated after checkout. We will reach out via email if provided."
              : "Pickup orders will be ready during our normal farm pickup hours."}
          </div>
        </aside>
      </div>
    </section>
  );
}
