"use client";
import { useState } from "react";
import { updateOrderStatus } from "@/lib/api";

export default function UpdateStatus({ id, current }: { id: number; current: string }) {
  const [status, setStatus] = useState(current);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateOrderStatus(id, status);
      setMessage("Saved");
      setTimeout(() => setMessage(null), 1000);
    } catch (e: any) {
      setError(e.message || "Failed");
      setTimeout(() => setError(null), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-600">Status:</label>
      <select className="border rounded px-2 py-1 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
        {['pending','paid','processing','completed','cancelled'].map((s)=> (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button onClick={save} disabled={saving} className="text-blue-700 hover:underline text-sm">
        {saving ? 'Saving...' : 'Save'}
      </button>
      {message && <span className="text-emerald-700 text-sm">{message}</span>}
      {error && <span className="text-red-700 text-sm">{error}</span>}
    </div>
  );
}

