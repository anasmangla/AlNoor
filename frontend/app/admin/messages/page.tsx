"use client";
import { useEffect, useState } from "react";
import { listMessages, deleteMessage, type ContactMessage } from "@/lib/api";
import Spinner from "@/components/Spinner";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await listMessages();
      setMessages(data.sort((a,b)=> (a.created_at < b.created_at ? 1 : -1)));
    } catch (e: any) {
      setError(e.message || "Failed to load messages");
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
    } catch (e: any) {
      setError(e.message || "Failed to delete message");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4">Contact Messages</h1>
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 p-2 rounded">{error}</div>
      )}
      {loading ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <p className="text-slate-600">No messages yet.</p>
      ) : (
        <ul className="grid gap-2">
          {messages.map((m) => (
            <li key={m.id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{m.name || "(No name)"}</div>
                <div className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString()}</div>
              </div>
              {m.email && (
                <div className="text-sm text-slate-600 mb-1">{m.email}</div>
              )}
              <div className="text-slate-700 whitespace-pre-wrap">{m.message}</div>
              <div className="mt-2">
                <button onClick={() => onDelete(m.id)} className="text-red-700 hover:underline text-sm">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
