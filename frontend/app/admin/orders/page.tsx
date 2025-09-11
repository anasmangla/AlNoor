"use client";
import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useMemo, useState as useStateReact } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listOrders();
        setOrders(data);
      } catch (e: any) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onChangeStatus(id: number, newStatus: string) {
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (e: any) {
      setError(e.message || "Failed to update order");
    }
  }

  const [statusFilter, setStatusFilter] = useState("all");
  const [idQuery, setIdQuery] = useState("");
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const okStatus = statusFilter === "all" || o.status === statusFilter;
      const okId = idQuery.trim() === "" || String(o.id).includes(idQuery.trim());
      return okStatus && okId;
    });
  }, [orders, statusFilter, idQuery]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="flex items-center gap-3 mb-3">
        <label className="text-sm text-slate-600">Status</label>
        <select className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value)}>
          {['all','pending','paid','processing','completed','cancelled'].map(s=> (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          className="border rounded px-2 py-1 text-sm"
          placeholder="Order ID"
          value={idQuery}
          onChange={(e)=> setIdQuery(e.target.value)}
        />
      </div>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">No orders yet.</p>
      ) : (
        <ul className="grid gap-3">
          {filtered.map((o) => (
            <li key={o.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  <a className="hover:underline" href={`/admin/orders/${o.id}`}>Order #{o.id}</a>
                </div>
                <div className="text-sm text-slate-600">{o.source.toUpperCase()}</div>
              </div>
              <div className="text-slate-700 flex items-center gap-3 flex-wrap">
                <span>${o.total_amount.toFixed(2)}</span>
                {o.created_at && (
                  <span className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
                )}
                <span className="text-sm text-slate-600">Status:</span>
                <select
                  className="border rounded px-1 py-0.5 text-sm"
                  value={o.status}
                  onChange={(e) => onChangeStatus(o.id, e.target.value)}
                >
                  {['pending','paid','processing','completed','cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <ul className="text-sm text-slate-600 mt-1">
                {o.items.map((i, idx) => (
                  <li key={idx}>
                    {i.name} x {i.quantity} {i.unit || ""} @ ${i.price_each.toFixed(2)} = ${
                      i.subtotal.toFixed(2)
                    }
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
