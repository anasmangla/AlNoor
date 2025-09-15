"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Product,
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/api";
import Spinner from "@/components/Spinner";
import { useToast } from "@/components/Toast";

export const metadata = { title: "Admin Products", robots: { index: false, follow: false } };

export default function AdminProductsPage() {
  const toast = useToast();
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("");
  const [isWeightBased, setIsWeightBased] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; price?: string; stock?: string; unit?: string }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editStock, setEditStock] = useState("0");
  const [editUnit, setEditUnit] = useState("");
  const [editIsWeightBased, setEditIsWeightBased] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [lowThreshold, setLowThreshold] = useState<number>(5);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("alnoor_low_threshold") : null;
    if (raw) {
      const n = parseFloat(raw);
      if (!isNaN(n)) setLowThreshold(n);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alnoor_low_threshold", String(lowThreshold));
    }
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
    setFieldErrors({});
    try {
      const n = name.trim();
      const p = parseFloat(price);
      const s = parseFloat(stock);
      const fe: any = {};
      if (!n) fe.name = "Name is required";
      if (isNaN(p) || p < 0) fe.price = "Price must be a non-negative number";
      if (isNaN(s) || s < 0) fe.stock = "Stock must be a non-negative number";
      if ((unit || '').length > 50) fe.unit = "Unit max length is 50";
      if (Object.keys(fe).length) { setFieldErrors(fe); return; }
      await createProduct({
        name: n,
        price: p,
        stock: s,
        unit,
        is_weight_based: isWeightBased,
        image_url: imageUrl || undefined,
        description: desc || undefined,
      } as any);
      toast.success("Product created");
      setName("");
      setPrice("0");
      setStock("0");
      setUnit("");
      setIsWeightBased(false);
      setImageUrl("");
      setDesc("");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to create");
      toast.error(e.message || "Failed to create product");
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to delete");
      toast.error(e.message || "Failed to delete product");
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
    setEditDesc((p as any).description || "");
  }

  async function onSaveEdit() {
    if (editingId == null) return;
    try {
      const p = parseFloat(editPrice);
      const s = parseFloat(editStock);
      await updateProduct(
        editingId,
        {
          name: editName,
          price: p,
          stock: s,
          unit: editUnit,
          is_weight_based: editIsWeightBased,
          image_url: editImageUrl || undefined,
          description: editDesc || undefined,
        } as any
      );
      setEditingId(null);
      toast.success("Product updated");
      await load();
    } catch (e: any) {
      setError(e.message || "Failed to update");
      toast.error(e.message || "Failed to update product");
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
      const desc = String((p as any).description || "").toLowerCase();
      return (
        p.name.toLowerCase().includes(q) || unit.includes(q) || desc.includes(q)
      );
    });
  }, [products, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: number | string = a.name;
      let bv: number | string = b.name;
      if (sortBy === "price") {
        av = a.price;
        bv = b.price;
      } else if (sortBy === "stock") {
        av = (a as any).stock ?? 0;
        bv = (b as any).stock ?? 0;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = Number(av) - Number(bv);
      return sortDir === "asc" ? diff : -diff;
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
          {fieldErrors.name && <div className="text-xs text-red-700 mt-1">{fieldErrors.name}</div>}
        </div>
        <div>
          <label className="block text-sm text-slate-600">Price (USD)</label>
          <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={price} onChange={(e)=> setPrice(e.target.value)} />
          {fieldErrors.price && <div className="text-xs text-red-700 mt-1">{fieldErrors.price}</div>}
        </div>
        <div>
          <label className="block text-sm text-slate-600">Stock</label>
          <input type="number" step="0.01" min="0" className="border rounded px-2 py-1" value={stock} onChange={(e)=> setStock(e.target.value)} />
          {fieldErrors.stock && <div className="text-xs text-red-700 mt-1">{fieldErrors.stock}</div>}
        </div>
        <div>
          <label className="block text-sm text-slate-600">Unit</label>
          <input className="border rounded px-2 py-1" value={unit} onChange={(e)=> setUnit(e.target.value)} placeholder="each, lb, dozen, ..." />
          {fieldErrors.unit && <div className="text-xs text-red-700 mt-1">{fieldErrors.unit}</div>}
        </div>
        <div className="flex items-center gap-2">
          <input id="isWeightBased" type="checkbox" checked={isWeightBased} onChange={(e)=> setIsWeightBased(e.target.checked)} />
          <label htmlFor="isWeightBased" className="text-sm text-slate-600">Weight-based</label>
        </div>
        <div>
          <label className="block text-sm text-slate-600">Image URL</label>
          <input className="border rounded px-2 py-1 min-w-[280px]" value={imageUrl} onChange={(e)=> setImageUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="w-full max-w-xl">
          <label className="block text-sm text-slate-600">Description</label>
          <textarea className="border rounded px-2 py-1 w-full" rows={3} value={desc} onChange={(e)=> setDesc(e.target.value)} placeholder="Short description..." />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Add</button>
      </form>

      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <input
          className="border rounded px-2 py-1"
          placeholder="Filter by name, unit, or description..."
          value={query}
          onChange={(e)=> setQuery(e.target.value)}
        />
        <label className="text-sm text-slate-600">Sort</label>
        <select className="border rounded px-2 py-1 text-sm" value={sortBy} onChange={(e)=> setSortBy(e.target.value as any)}>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
        </select>
        <select className="border rounded px-2 py-1 text-sm" value={sortDir} onChange={(e)=> setSortDir(e.target.value as any)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <label className="text-sm text-slate-600">Low stock ≤</label>
        <input
          type="number"
          step="0.1"
          min="0"
          className="border rounded px-2 py-1 w-24 text-sm"
          value={lowThreshold}
          onChange={(e)=> setLowThreshold(parseFloat(e.target.value)||0)}
        />
        <button
          onClick={() => {
            const header = ["id","name","price","stock","unit","is_weight_based","image_url","description"];
            const rows = [
              header,
              ...sorted.map((p) => [
                p.id,
                p.name,
                typeof p.price === 'number' ? p.price.toFixed(2) : p.price,
                (p as any).stock ?? "",
                (p as any).unit ?? "",
                (p as any).is_weight_based ? 'true' : 'false',
                (p as any).image_url || '',
                (p as any).description || '',
              ])
            ];
            const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'products.csv'; a.click(); URL.revokeObjectURL(url);
          }}
          className="text-emerald-700 hover:underline text-sm"
        >Export CSV</button>
        <label className="text-sm text-slate-600 ml-2">Import CSV</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={async (e)=>{
            const file = e.target.files?.[0]; if(!file) return;
            try{
              const text = await file.text();
              const lines = text.split(/\r?\n/).filter(Boolean);
              const header = lines.shift() || '';
              const cols = header.split(',').map(s=> s.replace(/^"|"$/g,'').trim().toLowerCase());
              const idx = (name:string)=> cols.indexOf(name);
              let created = 0; let failed = 0;
              for(const line of lines){
                const vals = line.match(/\"([^\"]|\"\")*\"|[^,]+/g)?.map(s=> s.replace(/^\"|\"$/g,'').replace(/\"\"/g,'"').trim()) || [];
                const rec: any = {
                  name: vals[idx('name')] || '',
                  price: parseFloat(vals[idx('price')] || '0') || 0,
                  stock: parseFloat(vals[idx('stock')] || '0') || 0,
                  unit: vals[idx('unit')] || '',
                  is_weight_based: ((vals[idx('is_weight_based')] || '').toLowerCase() === 'true'),
                  image_url: vals[idx('image_url')] || '',
                  description: vals[idx('description')] || '',
                };
                try { await createProduct(rec); created++; } catch { failed++; }
              }
              setError(`Import done. Created ${created}, failed ${failed}.`);
              await load();
            }catch(e:any){ setError(e.message||'Import failed'); }
          }}
        />
      </div>

      {loading ? (
        <Spinner />
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
                  <div className="w-full max-w-xl">
                    <label className="block text-xs text-slate-600">Description</label>
                    <textarea className="border rounded px-2 py-1 w-full" rows={2} value={editDesc} onChange={(e)=> setEditDesc(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-slate-600 text-sm">
                    ${p.price.toFixed(2)} / {(p as any).unit || "unit"} - Stock: {(p as any).stock ?? 0}
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
