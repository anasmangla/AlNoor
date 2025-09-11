import { cookies } from "next/headers";
import Link from "next/link";
import { API_BASE, type Order } from "@/lib/api";

type Props = { params: { id: string } };

export default async function AdminOrderDetail({ params }: Props) {
  const id = Number(params.id);
  const token = cookies().get("alnoor_token")?.value;
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    return (
      <section>
        <h1 className="text-2xl font-semibold mb-4">Order #{id}</h1>
        <p className="text-red-700">Failed to load order (status {res.status}).</p>
        <Link className="text-blue-600 hover:underline" href="/admin/orders">Back to Orders</Link>
      </section>
    );
  }
  const order: Order = await res.json();

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <Link className="text-blue-600 hover:underline" href="/admin/orders">Back to Orders</Link>
      </div>
      <div className="text-slate-700">Total: ${order.total_amount.toFixed(2)}</div>
      <div className="text-sm text-slate-600">Status: {order.status} · Source: {order.source.toUpperCase()}</div>
      <div>
        <h2 className="font-medium mb-2">Items</h2>
        <ul className="grid gap-2">
          {order.items.map((i, idx) => (
            <li key={idx} className="border rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-slate-600">{i.quantity} {i.unit || ""} × ${i.price_each.toFixed(2)}</div>
              </div>
              <div className="font-semibold">${i.subtotal.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

