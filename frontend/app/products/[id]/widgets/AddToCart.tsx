"use client";
import { useState } from "react";
import type { Product } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState<string>(product.is_weight_based ? "0.5" : "1");
  const [message, setMessage] = useState<string | null>(null);

  function onAdd() {
    const q = parseFloat(qty);
    if (isNaN(q) || q <= 0) return;
    add(product, q);
    setMessage("Added to cart");
    setTimeout(() => setMessage(null), 1200);
  }

  return (
    <div className="grid gap-3">
      <div>
        <label className="block text-sm text-slate-600">
          {product.is_weight_based ? `Weight (${product.unit})` : "Quantity"}
        </label>
        <input
          className="border rounded px-2 py-1 w-28"
          type="number"
          min={product.is_weight_based ? 0 : 1}
          step={product.is_weight_based ? 0.1 : 1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </div>
      <button
        onClick={onAdd}
        className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
      >
        Add to Cart
      </button>
      {message && (
        <div className="text-emerald-700 text-sm">{message}</div>
      )}
    </div>
  );
}

