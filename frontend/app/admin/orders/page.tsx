"use client";
import { useEffect, useMemo, useState } from "react";
import { listOrders, updateOrderStatus, type Order } from "@/lib/api";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";

export default function AdminOrdersPage() {
  const toast = useToast();
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
      const msg = e?.message || "Failed to load orders";
      setError(msg);
      if (msg.includes('401')) {
        try {
          localStorage.removeItem('alnoor_token');
          document.cookie = 'alnoor_token=; Path=/; Max-Age=0';
          window.location.href = `/admin/login?next=${encodeURIComponent('/admin/orders')}`;
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onChangeStatus(id: number, newStatus: string) {
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success("Order updated");
    } catch (e: any) {
      const msg = e?.message || "Failed to update order";
      setError(msg);
      if (msg.includes('401')) {
        try {
          localStorage.removeItem('alnoor_token');
          document.cookie = 'alnoor_token=; Path=/; Max-Age=0';
          window.location.href = `/admin/login?next=${encodeURIComponent('/admin/orders')}`;
        } catch {}
      }
      toast.error(e.message || "Failed to update order");
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

  const [cols, setCols] = useState({
    id: true,
    created_at: true,
    status: true,
    source: true,
    total: true,
    customer_name: true,
    customer_email: true,
    items: true,
  });
  function toggleCol(k: keyof typeof cols) {
    setCols((c) => ({ ...c, [k]: !c[k] }));
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <label className="text-sm text-slate-600" htmlFor="statusFilter">Status</label>
        <select id="statusFilter" className="border rounded px-2 py-1 text-sm" value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value)}>
          {['all','pending','paid','processing','completed','cancelled'].map(s=> (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input id="orderIdFilter"
          className="border rounded px-2 py-1 text-sm"
          placeholder="Order ID"
          value={idQuery}
          onChange={(e)=> setIdQuery(e.target.value)}
        />
        <label className="text-sm text-slate-600" htmlFor="fromDate">From</label>
        <input id="fromDate" type="date" className="border rounded px-2 py-1 text-sm" value={fromDate} onChange={(e)=> setFromDate(e.target.value)} />
        <label className="text-sm text-slate-600" htmlFor="toDate">To</label>
        <input id="toDate" type="date" className="border rounded px-2 py-1 text-sm" value={toDate} onChange={(e)=> setToDate(e.target.value)} />
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
        <button
          onClick={() => {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth()+1).padStart(2,'0');
            const firstDay = `${y}-${m}-01`;
            const toM = String(now.getMonth()+1).padStart(2,'0');
            const toD = String(now.getDate()).padStart(2,'0');
            const lastDay = `${y}-${toM}-${toD}`;
            setFromDate(firstDay);
            setToDate(lastDay);
            load();
          }}
          className="text-slate-700 hover:underline text-sm"
        >This Month</button>
      </div>
      <div className="mb-2 text-sm text-slate-700">{totals.count} orders â€¢ ${totals.sum.toFixed(2)}</div>
      <div className="mb-3 text-xs text-slate-600 flex items-center gap-3 flex-wrap">
        <span>CSV columns:</span>
        {(["id","created_at","status","source","total","customer_name","customer_email","items"] as const).map((k) => (
          <label key={k} className="inline-flex items-center gap-1">
            <input type="checkbox" checked={cols[k as keyof typeof cols]} onChange={() => toggleCol(k as any)} /> {k}
          </label>
        ))}
        <button
          onClick={() => {
            const header: string[] = [];
            const push = (n: string, ok: boolean) => { if (ok) header.push(n); };
            push('id', cols.id); push('created_at', cols.created_at); push('status', cols.status);
            push('source', cols.source); push('total', cols.total); push('customer_name', cols.customer_name);
            push('customer_email', cols.customer_email); push('items', cols.items);
            const rows = [header,
              ...filtered.map(o => {
                const row: any[] = [];
                if (cols.id) row.push(o.id);
                if (cols.created_at) row.push(o.created_at ? new Date(o.created_at).toISOString() : "");
                if (cols.status) row.push(o.status);
                if (cols.source) row.push(o.source);
                if (cols.total) row.push(o.total_amount.toFixed(2));
                if (cols.customer_name) row.push(o.customer_name || "");
                if (cols.customer_email) row.push(o.customer_email || "");
                if (cols.items) row.push(o.items.map(i=>`${i.name} x ${i.quantity} ${i.unit||""} @ ${i.price_each.toFixed(2)}`).join("; "));
                return row;
              })
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click(); URL.revokeObjectURL(url);
          }}
          className="text-emerald-700 hover:underline"
        >Export CSV</button>
      </div>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="text-red-800 underline text-sm">Retry</button>
        </div>
      )}
      {loading ? (
        <Spinner />
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

