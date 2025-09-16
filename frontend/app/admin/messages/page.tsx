"use client";
import { useEffect, useState } from "react";
import { listMessages, deleteMessage, type ContactMessage, logout as logoutSession } from "@/lib/api";
import { useToast } from "@/components/Toast";
import Spinner from "@/components/Spinner";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  async function logoutAndRedirect(nextPath: string) {
    try {
      await logoutSession();
    } catch (err) {
      console.error("Failed to clear session", err);
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = `/admin/login?next=${encodeURIComponent(nextPath)}`;
      }
    }
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMessages();
      setMessages(data.sort((a,b)=> (a.created_at < b.created_at ? 1 : -1)));
    } catch (e: any) {
      const msg = e?.message || "Failed to load messages";
      setError(msg);
      if (msg.includes('401')) await logoutAndRedirect('/admin/messages');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted");
    } catch (e: any) {
      const msg = e?.message || "Failed to delete message";
      setError(msg);
      if (msg.includes('401')) await logoutAndRedirect('/admin/messages');
      toast.error(e.message || "Failed to delete message");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Contact Messages</h1>
      {error && (
        <div className="mb-3 flex flex-col gap-2 rounded border border-red-200 bg-red-50 p-2 text-red-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span>{error}</span>
          <button onClick={load} className="text-red-800 underline text-sm">Retry</button>
        </div>
      )}
      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <p className="text-slate-600">No messages yet.</p>
      ) : (
        <ul className="grid gap-2">
          {messages.map((m) => (
            <li key={m.id} className="border rounded p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="font-medium">{m.name || "(No name)"}</div>
                <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              {m.email && (
                <div className="text-sm text-slate-600 mb-1">{m.email}</div>
              )}
              <div className="text-slate-700 whitespace-pre-wrap">{m.message}</div>
              <div className="mt-2">
                <button onClick={() => onDelete(m.id)} className="text-red-700 hover:underline text-sm" aria-label={`Delete message ${m.id}`}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
