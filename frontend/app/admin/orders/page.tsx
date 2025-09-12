"use client";
import { useEffect, useState } from "react";
import { listOrders, updateOrderStatus, type Order } from "@/lib/api";
import { useMemo } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listOrders({ startDate: fromDate || undefined, endDate: toDate || undefined });
      setOrders(data);
    } catch (e: any) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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

  const totals = useMemo(() => {
    const count = filtered.length;
    const sum = filtered.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    return { count, sum };
  }, [filtered]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
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
        <label className="text-sm text-slate-600">From</label>
        <input type="date" className="border rounded px-2 py-1 text-sm" value={fromDate} onChange={(e)=> setFromDate(e.target.value)} />
        <label className="text-sm text-slate-600">To</label>
        <input type="date" className="border rounded px-2 py-1 text-sm" value={toDate} onChange={(e)=> setToDate(e.target.value)} />
        <button onClick={load} className="text-blue-700 hover:underline text-sm">Apply</button>
        <button onClick={()=>{ setFromDate(""); setToDate(""); load(); }} className="text-slate-600 hover:underline text-sm">Clear</button>
        <span className="text-xs text-slate-500">Quick:</span>
        <button
          onClick={() => {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth()+1).padStart(2,'0');
            const d = String(today.getDate()).padStart(2,'0');
            setFromDate(`${y}-${m}-${d}`);
            setToDate(`${y}-${m}-${d}`);
            load();
          }}
          className="text-slate-700 hover:underline text-sm"
        >Today</button>
        <button
          onClick={() => {
            const now = new Date();
            const toY = now.getFullYear();
            const toM = String(now.getMonth()+1).padStart(2,'0');
            const toD = String(now.getDate()).padStart(2,'0');
            const past = new Date(now.getTime() - 6*24*60*60*1000);
            const fy = past.getFullYear();
            const fm = String(past.getMonth()+1).padStart(2,'0');
            const fd = String(past.getDate()).padStart(2,'0');
            setFromDate(`${fy}-${fm}-${fd}`);
            setToDate(`${toY}-${toM}-${toD}`);
            load();
          }}
          className="text-slate-700 hover:underline text-sm"
        >Last 7 days</button>
      </div>
      <div className="mb-3 text-sm text-slate-700">{totals.count} orders -  ${totals.sum.toFixed(2)}</div>
        <button
          onClick={() => {
            const rows = [
              ["id","created_at","status","source","total","customer_name","customer_email","items"],
              ...filtered.map(o => [
                o.id,
                o.created_at ? new Date(o.created_at).toISOString() : "",
                o.status,
                o.source,
                o.total_amount.toFixed(2),
                o.customer_name || "",
                o.customer_email || "",
                o.items.map(i=>`${i.name} x ${i.quantity} ${i.unit||""} @ ${i.price_each.toFixed(2)}`).join("; ")
              ])
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
          }}
          className="text-emerald-700 hover:underline text-sm"
        >
          Export CSV
        </button>\n      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">No orders - et.</p>
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
              {(o.customer_name || o.customer_email) && (
                <div className="text-xs text-slate-600 mt-1">
                  {o.customer_name ? <span>{o.customer_name}</span> : null}
                  {o.customer_email ? <span> - {o.customer_email}</span> : null}
                </div>
              )}
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

