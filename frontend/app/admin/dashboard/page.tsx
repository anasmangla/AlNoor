import { cookies } from "next/headers";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

type Metrics = {
  orders_total: number;
  revenue_total: number;
  orders_today: number;
  revenue_today: number;
  orders_month: number;
  revenue_month: number;
  low_stock_threshold: number;
  low_stock: Array<{ id: number; name: string; stock: number; unit: string }>;
};

export default async function AdminDashboardPage() {
  const token = cookies().get("alnoor_token")?.value;
  const res = await fetch(`${API_BASE}/admin/metrics`, {
    cache: "no-store",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const metrics: Metrics | null = res.ok ? await res.json() : null;

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      {!metrics ? (
        <p className="text-slate-600">Unable to load metrics.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Orders Today</div>
              <div className="text-2xl font-semibold">{metrics.orders_today}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Revenue Today</div>
              <div className="text-2xl font-semibold">${metrics.revenue_today.toFixed(2)}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Orders This Month</div>
              <div className="text-2xl font-semibold">{metrics.orders_month}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Revenue This Month</div>
              <div className="text-2xl font-semibold">${metrics.revenue_month.toFixed(2)}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Orders Total</div>
              <div className="text-2xl font-semibold">{metrics.orders_total}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-xs text-slate-600">Revenue Total</div>
              <div className="text-2xl font-semibold">${metrics.revenue_total.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-medium">Low Stock</h2>
              <Link className="text-blue-700 hover:underline text-sm" href="/admin/products">Manage Products</Link>
            </div>
            {metrics.low_stock.length === 0 ? (
              <p className="text-slate-600 text-sm">No low-stock products.</p>
            ) : (
              <ul className="grid gap-2">
                {metrics.low_stock.map((p) => (
                  <li key={p.id} className="border rounded p-2 flex items-center justify-between">
                    <div>{p.name}</div>
                    <div className="text-sm text-slate-700">{p.stock} {p.unit || ""}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="font-medium mb-2">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/admin/products" className="border rounded p-3 hover:bg-slate-50">
                <div className="font-medium">Add / Edit Products</div>
                <div className="text-sm text-slate-600">Manage inventory and pricing</div>
              </Link>
              <Link href="/admin/orders" className="border rounded p-3 hover:bg-slate-50">
                <div className="font-medium">View Orders</div>
                <div className="text-sm text-slate-600">Review and update statuses</div>
              </Link>
              <Link href="/admin/pos" className="border rounded p-3 hover:bg-slate-50">
                <div className="font-medium">Open POS</div>
                <div className="text-sm text-slate-600">In-person checkout</div>
              </Link>
              <Link href="/admin/messages" className="border rounded p-3 hover:bg-slate-50">
                <div className="font-medium">Messages</div>
                <div className="text-sm text-slate-600">Customer inquiries</div>
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
