"use client";
import { useEffect, useMemo, useState } from "react";
import { Product, fetchProducts, createOrder, createTerminalCheckout, pollTerminalCheckout } from "@/lib/api";

type SaleItem = { product: Product; quantity: number };

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sale, setSale] = useState<SaleItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [qty, setQty] = useState<string>("1");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const [terminalStatus, setTerminalStatus] = useState<string | null>(null);
  const [terminalId, setTerminalId] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') setHasToken(!!localStorage.getItem('alnoor_token'));
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const total = useMemo(
    () => sale.reduce((acc, s) => acc + s.product.price * s.quantity, 0),
    [sale]
  );

  function addItem() {
    const id = parseInt(selectedId, 10);
    const product = products.find((p) => p.id === id);
    const q = parseFloat(qty);
    if (!product || isNaN(q) || q <= 0) return;
    setSale((prev) => {
      const existing = prev.find((s) => s.product.id === product.id);
      if (existing) {
        return prev.map((s) =>
          s.product.id === product.id ? { ...s, quantity: s.quantity + q } : s
        );
      }
      return [...prev, { product, quantity: q }];
    });
  }

  async function checkout() {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const order = await createOrder({
        items: sale.map((s) => ({ product_id: s.product.id, quantity: s.quantity })),
        source: "pos",
      });
      setMessage(`Payment successful. Order #${order.id}`);
      setSale([]);
    } catch (e: any) {
      setError(e.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  async function checkoutWithTerminal() {
    setError(null);
    setMessage(null);
    setTerminalStatus(null);
    setTerminalId(null);
    setLoading(true);
    try {
      const totalCents = Math.round(total * 100);
      if (totalCents <= 0) throw new Error("Nothing to charge");
      const tc = await createTerminalCheckout({ amount_cents: totalCents, device_id: deviceId || undefined, reference_id: `POS-${Date.now()}` });
      setTerminalId(tc.checkout_id);
      setTerminalStatus(tc.status);
      // Poll until COMPLETED or timeout ~60s
      const started = Date.now();
      while (Date.now() - started < 60000) {
        await new Promise((r) => setTimeout(r, 2000));
        const p = await pollTerminalCheckout(tc.checkout_id);
        setTerminalStatus(p.status);
        if (p.status && ["COMPLETED", "CANCELED", "FAILED"].includes(p.status)) break;
      }
      if (terminalStatus && terminalStatus !== "COMPLETED") throw new Error(`Terminal status: ${terminalStatus}`);
      // Record order in DB
      const order = await createOrder({
        items: sale.map((s) => ({ product_id: s.product.id, quantity: s.quantity })),
        source: "pos",
      });
      setMessage(`Terminal payment complete. Order #${order.id}`);
      setSale([]);
    } catch (e: any) {
      setError(e.message || "Terminal checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">POS</h1>
      {!hasToken && (
        <div className="mb-3 text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded text-sm">
          For Square Terminal checkout, please <a href="/admin/login" className="underline">log in</a>.
        </div>
      )}
      {message && (
        <div className="mb-3 text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <div className="flex gap-2 items-end mb-4 flex-wrap">
        <div>
          <label className="block text-sm text-slate-600">Product</label>
          <select
            className="border rounded px-2 py-1 min-w-[200px]"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (${p.price.toFixed(2)} / {(p as any).unit || "unit"})
              </option>
            ))}
          </select>
        </div>
        <div>
          {(() => {
            const sel = products.find((p) => String(p.id) === selectedId) as any;
            const isWeight = sel?.is_weight_based;
            const unit = sel?.unit || "unit";
            return (
              <div>
                <label className="block text-sm text-slate-600">
                  {isWeight ? `Weight (${unit})` : "Quantity"}
                </label>
                <input
                  className="border rounded px-2 py-1 w-28"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  type="number"
                  min={isWeight ? "0" : "1"}
                  step={isWeight ? "0.01" : "1"}
                />
              </div>
            );
          })()}
        </div>
        <button
          onClick={addItem}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Add to Sale
        </button>
      </div>

      <ul className="grid gap-2 mb-4">
        {sale.map((s) => (
          <li key={s.product.id} className="border rounded p-2 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.product.name}</div>
              <div className="text-sm text-slate-600">
                {s.quantity} {(s.product as any).unit || "unit"} x ${s.product.price.toFixed(2)}
              </div>
            </div>
            <div className="font-semibold">
              ${(s.product.price * s.quantity).toFixed(2)}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Total: ${total.toFixed(2)}</div>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1"
            placeholder="Terminal Device ID (optional)"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />
          <button
            onClick={checkout}
            disabled={loading || sale.length === 0}
            className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Checkout (simulate)"}
          </button>
          <button
            onClick={checkoutWithTerminal}
            disabled={loading || sale.length === 0}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Processing..." : "Use Square Terminal"}
          </button>
          <button
            onClick={async ()=>{
              setLoading(true); setError(null); setMessage(null);
              try{
                const order = await createOrder({ items: sale.map((s)=>({product_id: s.product.id, quantity: s.quantity})), source: 'pos' });
                setMessage(`Cash received. Order #${order.id}`); setSale([]);
              }catch(e:any){ setError(e.message||'Cash checkout failed'); } finally { setLoading(false); }
            }}
            disabled={loading || sale.length === 0}
            className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Cash'}
          </button>
        </div>
      </div>
      {terminalId && (
        <div className="text-sm text-slate-600 mt-2">Terminal Checkout ID: {terminalId} • Status: {terminalStatus || "PENDING"}</div>
      )}
    </section>
  );
}
