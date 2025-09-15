"use client";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

export default function AdminSettingsPage() {
  const [hasToken, setHasToken] = useState(false);
  const [low, setLow] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<string>("");

  useEffect(() => {
    setHasToken(!!(typeof window !== "undefined" && localStorage.getItem("alnoor_token")));
    const raw = typeof window !== "undefined" ? localStorage.getItem("alnoor_low_threshold") : null;
    setLow(raw || "5");
  }, []);

  return (
    <section className="grid gap-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {!hasToken && (
        <div className="text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded text-sm">
          Not authenticated. Please <a href="/admin/login" className="underline">log in</a> to manage settings.
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Environment</h2>
        <div className="text-sm text-slate-700">API Base: <code>{API_BASE}</code></div>
        <div className="text-sm text-slate-700">Base Path: <code>{process.env.NEXT_PUBLIC_BASE_PATH || "(root)"}</code></div>
        <div className="mt-2">
          <button
            className="text-blue-700 hover:underline text-sm"
            onClick={async ()=>{
              setApiStatus('');
              try {
                const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
                setApiStatus(res.ok ? 'ok' : String(res.status));
              } catch (e: any) {
                setApiStatus(e?.message || 'unreachable');
              }
            }}
          >Ping API</button>
          {apiStatus && <span className="ml-2 text-sm text-slate-700">{apiStatus}</span>}
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Low Stock Threshold</h2>
        <div className="text-sm text-slate-600 mb-2">Used to highlight products with low inventory.</div>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 w-24"
            type="number"
            step="0.1"
            min="0"
            value={low}
            onChange={(e)=> setLow(e.target.value)}
          />
          <button
            className="text-emerald-700 hover:underline text-sm"
            onClick={()=>{
              if (typeof window !== 'undefined') {
                localStorage.setItem('alnoor_low_threshold', String(low||'0'));
              }
            }}
          >Save</button>
        </div>
      </div>

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2">Auth</h2>
        <div className="text-sm text-slate-700">Token: {hasToken ? 'present' : 'missing'}</div>
        {hasToken && (
          <button
            className="text-red-700 hover:underline text-sm mt-2"
            onClick={()=>{
              try { localStorage.removeItem('alnoor_token'); document.cookie = 'alnoor_token=; Path=/; Max-Age=0'; window.location.reload(); } catch {}
            }}
          >Logout</button>
        )}
      </div>
    </section>
  );
}

