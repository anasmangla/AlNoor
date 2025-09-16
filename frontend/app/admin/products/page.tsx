'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Product,
  fetchProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  fetchSession,
  logout as logoutSession,
} from '@/lib/api';
import Spinner from '@/components/Spinner';
import { useToast } from '@/components/Toast';

export default function AdminProductsPage() {
  const toast = useToast();
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('0');
  const [weight, setWeight] = useState('0');
  const [unit, setUnit] = useState('');
  const [cutType, setCutType] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('0');
  const [origin, setOrigin] = useState('');
  const [isWeightBased, setIsWeightBased] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    price?: string;
    stock?: string;
    unit?: string;
    weight?: string;
    cutType?: string;
    pricePerUnit?: string;
    origin?: string;
  }>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editStock, setEditStock] = useState('0');
  const [editWeight, setEditWeight] = useState('0');
  const [editUnit, setEditUnit] = useState('');
  const [editCutType, setEditCutType] = useState('');
  const [editPricePerUnit, setEditPricePerUnit] = useState('0');
  const [editOrigin, setEditOrigin] = useState('');
  const [editIsWeightBased, setEditIsWeightBased] = useState(false);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [lowThreshold, setLowThreshold] = useState<number>(5);
  const errorAlertClass = [
    'mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded',
    'flex items-center justify-between',
  ].join(' ');
  const listItemBaseClass = 'border rounded p-3 flex items-center justify-between gap-4';

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('alnoor_low_threshold') : null;
    if (raw) {
      const n = parseFloat(raw);
      if (!isNaN(n)) setLowThreshold(n);
    }
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('alnoor_low_threshold', String(lowThreshold));
    }
  }, [lowThreshold]);

  async function logoutAndRedirect(nextPath: string) {
    try {
      await logoutSession();
    } catch (err) {
      console.error('Failed to clear session', err);
    } finally {
      setHasToken(false);
      if (typeof window !== 'undefined') {
        window.location.href = `/admin/login?next=${encodeURIComponent(nextPath)}`;
      }
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load products';
      setError(msg);
      if (msg.includes('401')) await logoutAndRedirect('/admin/products');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchSession()
      .then((session) => {
        if (active) setHasToken(Boolean(session?.authenticated));
      })
      .catch(() => {
        if (active) setHasToken(false);
      })
      .finally(() => {
        if (active) {
          void load();
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    try {
      const n = name.trim();
      const p = parseFloat(price);
      const s = parseFloat(stock);
      const w = parseFloat(weight);
      const ppu = parseFloat(pricePerUnit);
      const u = unit.trim();
      const cut = cutType.trim();
      const orig = origin.trim();
      const fe: any = {};
      if (!n) fe.name = 'Name is required';
      if (isNaN(p) || p < 0) fe.price = 'Price must be a non-negative number';
      if (isNaN(s) || s < 0) fe.stock = 'Stock must be a non-negative number';
      if ((u || '').length > 50) fe.unit = 'Unit max length is 50';
      if (isNaN(w) || w < 0) fe.weight = 'Weight must be zero or greater';
      if (isNaN(ppu) || ppu < 0) fe.pricePerUnit = 'Price per unit must be zero or greater';
      if (cut.length > 100) fe.cutType = 'Cut type max length is 100';
      if (orig.length > 100) fe.origin = 'Origin max length is 100';
      if (Object.keys(fe).length) {
        setFieldErrors(fe);
        return;
      }
      await createProduct({
        name: n,
        price: p,
        stock: s,
        unit: u,
        is_weight_based: isWeightBased,
        image_url: imageUrl || undefined,
        description: desc || undefined,
        weight: isNaN(w) ? 0 : w,
        cut_type: cut || undefined,
        price_per_unit: isNaN(ppu) ? 0 : ppu,
        origin: orig || undefined,
      } as any);
      toast.success('Product created');
      setName('');
      setPrice('0');
      setStock('0');
      setWeight('0');
      setUnit('');
      setCutType('');
      setPricePerUnit('0');
      setOrigin('');
      setIsWeightBased(false);
      setImageUrl('');
      setDesc('');
      await load();
    } catch (e: any) {
      setError(e.message || 'Failed to create');
      toast.error(e.message || 'Failed to create product');
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      await load();
    } catch (e: any) {
      const msg = e?.message || 'Failed to delete';
      setError(msg);
      if (msg.includes('401')) await logoutAndRedirect('/admin/products');
      toast.error(e.message || 'Failed to delete product');
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditStock(String((p as any).stock ?? 0));
    setEditWeight(String((p as any).weight ?? 0));
    setEditUnit((p as any).unit ?? '');
    setEditCutType((p as any).cut_type || '');
    setEditPricePerUnit(String((p as any).price_per_unit ?? 0));
    setEditOrigin((p as any).origin || '');
    setEditIsWeightBased(!!(p as any).is_weight_based);
    setEditImageUrl((p as any).image_url || '');
    setEditDesc((p as any).description || '');
  }

  async function onSaveEdit() {
    if (editingId == null) return;
    try {
      const p = parseFloat(editPrice);
      const s = parseFloat(editStock);
      const w = parseFloat(editWeight);
      const ppu = parseFloat(editPricePerUnit);
      const u = editUnit.trim();
      const cut = editCutType.trim();
      const orig = editOrigin.trim();
      await updateProduct(editingId, {
        name: editName,
        price: p,
        stock: s,
        unit: u,
        is_weight_based: editIsWeightBased,
        image_url: editImageUrl || undefined,
        description: editDesc || undefined,
        weight: isNaN(w) ? 0 : w,
        cut_type: cut || undefined,
        price_per_unit: isNaN(ppu) ? 0 : ppu,
        origin: orig || undefined,
      } as any);
      setEditingId(null);
      toast.success('Product updated');
      await load();
    } catch (e: any) {
      const msg = e?.message || 'Failed to update';
      setError(msg);
      if (msg.includes('401')) await logoutAndRedirect('/admin/products');
      toast.error(e.message || 'Failed to update product');
    }
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const unit = String((p as any).unit || '').toLowerCase();
      const desc = String((p as any).description || '').toLowerCase();
      const cut = String((p as any).cut_type || '').toLowerCase();
      const origin = String((p as any).origin || '').toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        unit.includes(q) ||
        desc.includes(q) ||
        cut.includes(q) ||
        origin.includes(q)
      );
    });
  }, [products, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: number | string = a.name;
      let bv: number | string = b.name;
      if (sortBy === 'price') {
        av = a.price;
        bv = b.price;
      } else if (sortBy === 'stock') {
        av = (a as any).stock ?? 0;
        bv = (b as any).stock ?? 0;
      }
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const diff = Number(av) - Number(bv);
      return sortDir === 'asc' ? diff : -diff;
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin Products</h1>
      {!hasToken && (
        <div className="mb-3 text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded">
          Not authenticated. Please{' '}
          <a href="/admin/login" className="underline">
            log in
          </a>{' '}
          to manage products.
        </div>
      )}
      {error && (
        <div className="mb-3 flex flex-col gap-2 rounded border border-red-200 bg-red-50 p-2 text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">

          <span>{error}</span>
          <button onClick={load} className="text-red-800 underline text-sm">
            Retry
          </button>
        </div>
      )}

      <form onSubmit={onCreate} className="mb-6 grid gap-3 sm:flex sm:flex-wrap sm:items-end">
        <div className="w-full sm:min-w-[200px]">
          <label className="block text-sm text-slate-600" htmlFor="prodName">Name</label>
          <input
            id="prodName"
            className="w-full rounded border px-2 py-1"
            value={name}
            onChange={(e)=> setName(e.target.value)}
            placeholder="Product name"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? 'errName' : undefined}
          />
          {fieldErrors.name && (
            <div id="errName" className="mt-1 text-xs text-red-700">{fieldErrors.name}</div>
          )}
        </div>
        <div className="w-full sm:min-w-[140px] sm:w-auto">
          <label className="block text-sm text-slate-600" htmlFor="prodPrice">Price (USD)</label>
          <input
            id="prodPrice"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded border px-2 py-1 sm:w-32"
            value={price}
            onChange={(e)=> setPrice(e.target.value)}
            aria-invalid={!!fieldErrors.price}
            aria-describedby={fieldErrors.price ? 'errPrice' : undefined}
          />
          {fieldErrors.price && (
<
            <div id="errPrice" className="mt-1 text-xs text-red-700">{fieldErrors.price}</div>
          )}
        </div>
        <div className="w-full sm:min-w-[140px] sm:w-auto">
          <label className="block text-sm text-slate-600" htmlFor="prodStock">Stock</label>
          <input
            id="prodStock"
            type="number"
            step="0.01"
            min="0"
            className="w-full rounded border px-2 py-1 sm:w-32"
            value={stock}
            onChange={(e)=> setStock(e.target.value)}
            aria-invalid={!!fieldErrors.stock}
            aria-describedby={fieldErrors.stock ? 'errStock' : undefined}
          />
          {fieldErrors.stock && (
            <div id="errStock" className="mt-1 text-xs text-red-700">{fieldErrors.stock}</div>
          )}
        </div>
        <div className="w-full sm:min-w-[160px] sm:w-auto">
          <label className="block text-sm text-slate-600" htmlFor="prodUnit">Unit</label>
          <input
            id="prodUnit"
            className="w-full rounded border px-2 py-1"
            value={unit}
            onChange={(e)=> setUnit(e.target.value)}
            placeholder="each, lb, dozen, ..."
            aria-invalid={!!fieldErrors.unit}
            aria-describedby={fieldErrors.unit ? 'errUnit' : undefined}
          />

          {fieldErrors.unit && (
            <div id="errUnit" className="mt-1 text-xs text-red-700">{fieldErrors.unit}</div>
          )}
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input id="isWeightBased" type="checkbox" checked={isWeightBased} onChange={(e)=> setIsWeightBased(e.target.checked)} />
          <label htmlFor="isWeightBased" className="text-sm text-slate-600">Weight-based</label>
        </div>
        <div className="w-full sm:min-w-[260px]">
          <label className="block text-sm text-slate-600">Image URL</label>
          <input
            className="w-full rounded border px-2 py-1"
            value={imageUrl}
            onChange={(e)=> setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="w-full sm:max-w-xl">
          <label className="block text-sm text-slate-600">Description</label>
          <textarea
            className="border rounded px-2 py-1 w-full"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description..."
          />
        </div>
        <button type="submit" className="w-full rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 sm:w-auto">Add</button>
      </form>

      <div className="mb-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
        <input
          className="w-full rounded border px-2 py-1 sm:flex-1 sm:w-auto"
          placeholder="Filter by name, unit, or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="text-sm text-slate-600">Sort</label>

        <select className="w-full rounded border px-2 py-1 text-sm sm:w-auto" value={sortBy} onChange={(e)=> setSortBy(e.target.value as any)}>

          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="stock">Stock</option>
        </select>

        <select className="w-full rounded border px-2 py-1 text-sm sm:w-auto" value={sortDir} onChange={(e)=> setSortDir(e.target.value as any)}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
        <label className="text-sm text-slate-600">Low stock ≤</label>
        <input
          type="number"
          step="0.1"
          min="0"
          className="w-full rounded border px-2 py-1 text-sm sm:w-24"
          value={lowThreshold}
          onChange={(e) => setLowThreshold(parseFloat(e.target.value) || 0)}
        />
        <button
          aria-label="Export products to CSV"
          onClick={() => {
            const header = [
              'id',
              'name',
              'price',
              'stock',
              'weight',
              'unit',
              'price_per_unit',
              'cut_type',
              'origin',
              'is_weight_based',
              'image_url',
              'description',
            ];
            const rows = [
              header,
              ...sorted.map((p) => [
                p.id,
                p.name,
                typeof p.price === 'number' ? p.price.toFixed(2) : p.price,
                (p as any).stock ?? '',
                (p as any).weight ?? '',
                (p as any).unit ?? '',
                typeof (p as any).price_per_unit === 'number'
                  ? Number((p as any).price_per_unit).toFixed(2)
                  : ((p as any).price_per_unit ?? ''),
                (p as any).cut_type || '',
                (p as any).origin || '',
                (p as any).is_weight_based ? 'true' : 'false',
                (p as any).image_url || '',
                (p as any).description || '',
              ]),
            ];
            const csv = rows
              .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.csv';
            a.click();
            URL.revokeObjectURL(url);
            try {
              toast.success('Exported');
            } catch {}
          }}
          className="text-emerald-700 hover:underline text-sm"
        >
          Export CSV
        </button>
        <label className="text-sm text-slate-600 ml-2">Import CSV</label>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="Import products from CSV"
          className="w-full sm:w-auto"
          onChange={async (e)=>{
            const file = e.target.files?.[0]; if(!file) return;
            try{
              const text = await file.text();
              const lines = text.split(/\r?\n/).filter(Boolean);
              const header = lines.shift() || '';
              const cols = header
                .split(',')
                .map((s) => s.replace(/^"|"$/g, '').trim().toLowerCase());
              const idx = (name: string) => cols.indexOf(name);
              let created = 0;
              let failed = 0;
              for (const line of lines) {
                const vals =
                  line.match(/\"([^\"]|\"\")*\"|[^,]+/g)?.map((s) =>
                    s
                      .replace(/^\"|\"$/g, '')
                      .replace(/\"\"/g, '"')
                      .trim(),
                  ) || [];
                const getVal = (name: string) => {
                  const position = idx(name);
                  return position >= 0 ? vals[position] : '';
                };
                const parseNum = (value: string) => {
                  const num = parseFloat(value || '0');
                  return Number.isFinite(num) ? num : 0;
                };
                const rec: any = {
                  name: getVal('name') || '',
                  price: parseNum(getVal('price')),
                  stock: parseNum(getVal('stock')),
                  weight: parseNum(getVal('weight')),
                  unit: getVal('unit') || '',
                  price_per_unit: parseNum(getVal('price_per_unit')),
                  cut_type: getVal('cut_type') || '',
                  origin: getVal('origin') || '',
                  is_weight_based: (getVal('is_weight_based') || '').toLowerCase() === 'true',
                  image_url: getVal('image_url') || '',
                  description: getVal('description') || '',
                };
                try {
                  await createProduct(rec);
                  created++;
                } catch {
                  failed++;
                }
              }
              setError(`Import done. Created ${created}, failed ${failed}.`);
              await load();
            } catch (e: any) {
              setError(e.message || 'Import failed');
            }
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
            <li
              key={p.id}
              className={`border rounded p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${((p as any).stock||0) <= lowThreshold ? 'border-red-300 bg-red-50' : ''}`}
            >
              {editingId === p.id ? (
                <div className="flex-1 grid gap-2 sm:flex sm:flex-wrap sm:items-end">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs text-slate-600">Name</label>
                    <input className="w-full rounded border px-2 py-1" value={editName} onChange={(e)=> setEditName(e.target.value)} />
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs text-slate-600">Price</label>
                    <input type="number" step="0.01" min="0" className="w-full rounded border px-2 py-1 sm:w-32" value={editPrice} onChange={(e)=> setEditPrice(e.target.value)} />
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs text-slate-600">Stock</label>
                    <input type="number" step="0.01" min="0" className="w-full rounded border px-2 py-1 sm:w-32" value={editStock} onChange={(e)=> setEditStock(e.target.value)} />
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs text-slate-600">Unit</label>
                    <input className="w-full rounded border px-2 py-1" value={editUnit} onChange={(e)=> setEditUnit(e.target.value)} />
                  </div>
                  <div className="flex items-center gap-2 pt-2 sm:pt-5">
                    <input id="editIsWeightBased" type="checkbox" checked={editIsWeightBased} onChange={(e)=> setEditIsWeightBased(e.target.checked)} />
                    <label htmlFor="editIsWeightBased" className="text-xs text-slate-600">Weight-based</label>
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs text-slate-600">Image URL</label>
                    <input className="w-full rounded border px-2 py-1 sm:min-w-[260px]" value={editImageUrl} onChange={(e)=> setEditImageUrl(e.target.value)} />
                  </div>
                  <div className="w-full sm:max-w-xl">
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
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
                {(p as any).image_url ? (
                  <img src={(p as any).image_url} alt={p.name} className="h-12 w-12 rounded border object-cover" />
                ) : null}
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
                    <div>
                      <label className="block text-xs text-slate-600">Stock</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="border rounded px-2 py-1"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Weight</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="border rounded px-2 py-1"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Unit</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Price / unit</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="border rounded px-2 py-1"
                        value={editPricePerUnit}
                        onChange={(e) => setEditPricePerUnit(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Cut type</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={editCutType}
                        onChange={(e) => setEditCutType(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Origin</label>
                      <input
                        className="border rounded px-2 py-1"
                        value={editOrigin}
                        onChange={(e) => setEditOrigin(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        id="editIsWeightBased"
                        type="checkbox"
                        checked={editIsWeightBased}
                        onChange={(e) => setEditIsWeightBased(e.target.checked)}
                      />
                      <label htmlFor="editIsWeightBased" className="text-xs text-slate-600">
                        Weight-based
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600">Image URL</label>
                      <input
                        className="border rounded px-2 py-1 min-w-[260px]"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                      />
                    </div>
                    <div className="w-full max-w-xl">
                      <label className="block text-xs text-slate-600">Description</label>
                      <textarea
                        className="border rounded px-2 py-1 w-full"
                        rows={2}
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-slate-600 text-sm">
                      ${p.price.toFixed(2)} / {detail.unit || 'unit'} - Stock: {detail.stock ?? 0}
                    </div>
                    {showDetail && (
                      <div className="text-slate-500 text-xs flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        {weightVal > 0 && (
                          <span>
                            Weight: {weightVal.toFixed(2)} {detail.unit || ''}
                          </span>
                        )}
                        {pricePerUnitVal > 0 && (
                          <span>Price/unit: ${pricePerUnitVal.toFixed(2)}</span>
                        )}
                        {cut && <span>Cut: {cut}</span>}
                        {origin && <span>Origin: {origin}</span>}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {detail.image_url ? (
                    <img
                      src={detail.image_url}
                      alt={p.name}
                      className="h-10 w-10 object-cover rounded border"
                    />
                  ) : null}
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
                      <button
                        onClick={() => startEdit(p)}
                        className="text-blue-700 hover:underline"
                        aria-label={`Edit ${p.name}`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="text-red-700 hover:underline"
                        aria-label={`Delete ${p.name}`}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
