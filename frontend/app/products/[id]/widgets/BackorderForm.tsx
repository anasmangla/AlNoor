"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Product } from "@/lib/api";
import { createBackorderRequest } from "@/lib/api";

type Props = {
  product: Product;
};

export default function BackorderForm({ product }: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<string>(
    product.is_weight_based ? "1" : "1"
  );
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setMessage("");
    if (!email.trim()) {
      setStatus("error");
      setMessage("Email is required");
      return;
    }
    setLoading(true);
    try {
      const qty = quantity.trim() ? parseFloat(quantity) : undefined;
      await createBackorderRequest(product.id, {
        email: email.trim(),
        name: name.trim() || undefined,
        quantity: qty && !isNaN(qty) && qty > 0 ? qty : undefined,
        note: note.trim() || undefined,
      });
      setStatus("success");
      setMessage("We received your reservation request. We'll email you soon.");
      setEmail("");
      setName("");
      setQuantity(product.is_weight_based ? "1" : "1");
      setNote("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Unable to submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <div>
        <label className="block text-sm text-slate-600" htmlFor="backorderEmail">
          Email address
        </label>
        <input
          id="backorderEmail"
          type="email"
          required
          className="border rounded px-2 py-1 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600" htmlFor="backorderName">
            Name (optional)
          </label>
          <input
            id="backorderName"
            type="text"
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600" htmlFor="backorderQty">
            Desired {product.is_weight_based ? `weight (${product.unit})` : "quantity"}
          </label>
          <input
            id="backorderQty"
            type="number"
            min={product.is_weight_based ? 0.1 : 1}
            step={product.is_weight_based ? 0.1 : 1}
            className="border rounded px-2 py-1 w-full"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={product.is_weight_based ? "1" : "1"}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600" htmlFor="backorderNote">
          Notes (optional)
        </label>
        <textarea
          id="backorderNote"
          className="border rounded px-2 py-1 w-full"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tell us if you have any preferences"
        />
      </div>
      <button
        type="submit"
        className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Sending..." : "Reserve & Notify Me"}
      </button>
      {status !== "idle" && message && (
        <div
          className={`text-sm ${
            status === "success" ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
