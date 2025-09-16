import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { API_BASE, type Order } from "@/lib/api";
import UpdateStatus from "./widgets/UpdateStatus";

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
    if (res.status === 401) {
      redirect(`/admin/login?next=/admin/orders/${id}`);
    }
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
      <div className="text-sm text-slate-600">
        Status: {order.status} • Source: {order.source.toUpperCase()} • Fulfillment: {((order.fulfillment_method || "pickup").toLowerCase() === "delivery" ? "Delivery" : "Pickup")}
      </div>
      <div className="text-sm text-slate-600">
        {order.created_at && <span>Created: {new Date(order.created_at).toLocaleString()} • </span>}
        {order.customer_name && <span>Name: {order.customer_name} • </span>}
        {order.customer_email && <span>Email: {order.customer_email}</span>}
      </div>
      <UpdateStatus id={order.id} current={order.status} />
      <div>
        <h2 className="font-medium mb-2">Items</h2>
        <ul className="grid gap-2">
          {order.items.map((i, idx) => (
            <li key={idx} className="border rounded p-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-sm text-slate-600">{i.quantity} {i.unit || ""} • ${i.price_each.toFixed(2)}</div>
              </div>
              <div className="font-semibold">${i.subtotal.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
