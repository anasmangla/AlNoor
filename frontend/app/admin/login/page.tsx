"use client";
import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const next = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null) || '/admin/products';
      const safeNext = next.startsWith('/') ? next : '/admin/products';
      router.push(safeNext);
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="grid gap-3 max-w-sm">
        <div>
          <label className="block text-sm text-slate-600" htmlFor="user">Username</label>
          <input
            id="user"
            className="border rounded px-2 py-1 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600" htmlFor="pass">Password</label>
          <input
            id="pass"
            type="password"
            className="border rounded px-2 py-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
}





