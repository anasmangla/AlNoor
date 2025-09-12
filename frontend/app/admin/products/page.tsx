"use client";
import { useEffect, useMemo, useState } from "react";
import { Product, fetchProducts, createProduct, deleteProduct, updateProduct } from "@/lib/api";

export default function AdminProductsPage() {
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("");
  const [isWeightBased, setIsWeightBased] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editStock, setEditStock] = useState("0");
  const [editUnit, setEditUnit] = useState("");
  const [editIsWeightBased, setEditIsWeightBased] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDir, setSortDir] = useState<string>("asc");
  const [lowThreshold, setLowThreshold] = useState<number>(5);
  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('alnoor_low_threshold') : null;
    if (raw) {
      const n = parseFloat(raw); if (!isNaN(n)) setLowThreshold(n);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('alnoor_low_threshold', String(lowThreshold));
  }, [lowThreshold]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: any) {
      setError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!localStorage.getItem("alnoor_token"));
    }
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const n = name.trim();
      const p = parseFloat(price);
      const s = parseFloat(stock);
      if (!n || isNaN(p) || isNaN(s)) return;
      await createProduct({ name: n, price: p, stock: s, unit, is_weight_based: isWeightBased, image_url: imageUrl } as any);
      setName("");
      setPrice("0");
      setStock("0");
      setUnit("");
      setIsWeightBased(false);
      setImageUrl("");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create");
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteProduct(id);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditStock(String((p as any).stock ?? 0));
    setEditUnit((p as any).unit ?? "");
    setEditIsWeightBased(!!(p as any).is_weight_based);
    setEditImageUrl((p as any).image_url || "");
  }

  async function onSaveEdit() {
    if (editingId == null) return;
    try {
      const p = parseFloat(editPrice);
      const s = parseFloat(editStock);
      await updateProduct(editingId, { name: editName, price: p, stock: s, unit: editUnit, is_weight_based: editIsWeightBased, image_url: editImageUrl } as any);
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const unit = String((p as any).unit || "").toLowerCase();
      return p.name.toLowerCase().includes(q) || unit.includes(q);
    });
  }, [products, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") return a.name.localeCompare(b.name) * mul;
      if (sortBy === "price") return ((a.price || 0) - (b.price || 0)) * mul;
      if (sortBy === "stock") return (((a as any).stock || 0) - ((b as any).stock || 0)) * mul;
      return 0;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin Products</h1>
      {!hasToken && (
        <div className="mb-3 text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded">
          Not authenticated. Please <a href="/admin/login" className="underline">log in</a> to manage products.
        </div>
      )}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</div>
      )}
      <form onSubmit={onCreate} className="mb-6 flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-sm text-slate-600">Name</label>
          <input className="border rounded px-2 py-1" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Product name" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Price (USD)</label>
          <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={price} onChange={(e)=> setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Stock</label>
          <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={stock} onChange={(e)=> setStock(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Unit</label>
          <input className="border rounded px-2 py-1" value={unit} onChange={(e)=> setUnit(e.target.value)} placeholder="each, lb, dozen, ..." />
        </div>
        <div className="flex items-center gap-2">
          <input id="isWeightBased" type="checkbox" checked={isWeightBased} onChange={(e)=> setIsWeightBased(e.target.checked)} />
          <label htmlFor="isWeightBased" className="text-sm text-slate-600">Weight-based</label>
        </div>
        <div>
          <label className="block text-sm text-slate-600">Image URL</label>
          <input className="border rounded px-2 py-1 min-w-[280px]" value={imageUrl} onChange={(e)=> setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Add</button>
      </form>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <input className="border rounded px-2 py-1" placeholder="Filter by name or unit..." value={query} onChange={(e)=> setQuery(e.target.value)} />
        <label className="text-sm text-slate-600">Sort</label>
        <select className="border rounded px-2 py-1 text-sm" value={sortBy} onChange={(e)=> setSortBy(e.target.value)}>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={sortDir} onChange={(e)=> setSortDir(e.target.value)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <label className="text-sm text-slate-600">Low stock ≤</label>
        <input type="number" step="0.01" min="0" className="border rounded px-2 py-1 text-sm w-24" value={lowThreshold} onChange={(e)=> setLowThreshold(parseFloat(e.target.value)||0)} />
      </div>

      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-600">No products yet.</p>
      ) : (
        <ul className="grid gap-2">
          {sorted.map((p) => (
            <li key={p.id} className={`border rounded p-3 flex items-center justify-between gap-4 ${((p as any).stock||0) <= lowThreshold ? 'border-red-300 bg-red-50' : ''}`}>
              {editingId === p.id ? (
                <div className="flex-1 flex items-end gap-2 flex-wrap">
                  <div>
                    <label className="block text-xs text-slate-600">Name</label>
                    <input className="border rounded px-2 py-1" value={editName} onChange={(e)=> setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">Price</label>
                    <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={editPrice} onChange={(e)=> setEditPrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">Stock</label>
                    <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={editStock} onChange={(e)=> setEditStock(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">Unit</label>
                    <input className="border rounded px-2 py-1" value={editUnit} onChange={(e)=> setEditUnit(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input id="editIsWeightBased" type="checkbox" checked={editIsWeightBased} onChange={(e)=> setEditIsWeightBased(e.target.checked)} />
                    <label htmlFor="editIsWeightBased" className="text-xs text-slate-600">Weight-based</label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">Image URL</label>
                    <input className="border rounded px-2 py-1 min-w-[260px]" value={editImageUrl} onChange={(e)=> setEditImageUrl(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-slate-600 text-sm">
                    ${p.price.toFixed(2)} / {(p as any).unit || "unit"} — Stock: {(p as any).stock ?? 0} {((p as any).unit || "")} {((p as any).stock||0) <= lowThreshold ? '(low)' : ''}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                {(p as any).image_url ? (<img src={(p as any).image_url} alt={p.name} className="h-10 w-10 object-cover rounded border" />) : null}
                {editingId === p.id ? (
                  <>
                    <button onClick={onSaveEdit} className="text-emerald-700 hover:underline">Save</button>
                    <button onClick={cancelEdit} className="text-slate-600 hover:underline">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} className="text-blue-700 hover:underline">Edit</button>
                    <button onClick={() => onDelete(p.id)} className="text-red-700 hover:underline">Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
