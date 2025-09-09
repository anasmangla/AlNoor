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
      const res = await login(username, password);
      // Store token for future use (placeholder)
      localStorage.setItem("alnoor_token", res.access_token);
      // Also set a cookie so middleware can protect /admin routes
      const maxAge = 60 * 60 * 24; // 1 day
      document.cookie = `alnoor_token=${res.access_token}; Path=/; Max-Age=${maxAge}`;
      router.push("/admin/products");
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
          <label className="block text-sm text-slate-600">Username</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input
            type="password"
            className="border rounded px-2 py-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
