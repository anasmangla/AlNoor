"use client";
import { useEffect, useState } from "react";
import { listOrders, type Order } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [Loading...setLoading...= useState(false);

  useEffect(() => {
    (async () => {
      setLoading...rue);
      setError(null);
      try {
        const data = await listOrders();
        setOrders(data);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading...alse);
      }
    })();
  }, []);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      {Loading... (
        <p className="text-slate-600">Loading...¦</p>
      ) : orders.length === 0 ? (
        <p className="text-slate-600">No orders yet.</p>
      ) : (
        <ul className="grid gap-3">
          {orders.map((o) => (
            <li key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-slate-600">{o.source.toUpperCase()}</div>
              </div>
              <div className="text-slate-700">${o.total_amount.toFixed(2)}</div>
              <ul className="text-sm text-slate-600 mt-1">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} x {i.quantity} {i.unit || ""} @ ${i.price_each.toFixed(2)} = $
                    {i.subtotal.toFixed(2)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
