"use client";
import { useEffect, useState } from "react";
import {
  Product,
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("0");

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
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const n = name.trim();
      const p = parseFloat(price);
      if (!n || isNaN(p)) return;
      await createProduct({ name: n, price: p });
      setName("");
      setPrice("0");
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
  }

  async function onSaveEdit() {
    if (editingId == null) return;
    try {
      const p = parseFloat(editPrice);
      await updateProduct(editingId, { name: editName, price: p });
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to update");
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin · Products</h1>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={onCreate} className="mb-6 flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-sm text-slate-600">Name</label>
          <input
            className="border rounded px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="border rounded px-2 py-1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
        >
          Add
        </button>
      </form>

      {loading ? (
        <p className="text-slate-600">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-slate-600">No products yet.</p>
      ) : (
        <ul className="grid gap-2">
          {products.map((p) => (
            <li key={p.id} className="border rounded p-3 flex items-center justify-between gap-4">
              {editingId === p.id ? (
                <div className="flex-1 flex items-end gap-2 flex-wrap">
                  <div>
                    <label className="block text-xs text-slate-600">Name</label>
                    <input
                      className="border rounded px-2 py-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="border rounded px-2 py-1"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-slate-600 text-sm">${p.price.toFixed(2)}</div>
                </div>
              )}
              <div className="flex items-center gap-3">
                {editingId === p.id ? (
                  <>
                    <button onClick={onSaveEdit} className="text-emerald-700 hover:underline">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="text-slate-600 hover:underline">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(p)} className="text-blue-700 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => onDelete(p.id)} className="text-red-700 hover:underline">
                      Delete
                    </button>
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
