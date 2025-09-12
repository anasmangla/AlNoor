"use client";
import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("Thanks! We will get back to you soon.");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch (err) {
      setStatus("Could not send. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <div>
        <label className="block text-sm text-slate-600">Name</label>
        <input className="border rounded px-2 py-1 w-full" value={name} onChange={(e)=> setName(e.target.value)} placeholder="Your name" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input type="email" className="border rounded px-2 py-1 w-full" value={email} onChange={(e)=> setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Phone</label>
          <input className="border rounded px-2 py-1 w-full" value={phone} onChange={(e)=> setPhone(e.target.value)} placeholder="(optional)" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600">Message</label>
        <textarea className="border rounded px-2 py-1 w-full" rows={4} value={message} onChange={(e)=> setMessage(e.target.value)} placeholder="How can we help?" />
      </div>
      <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-60" disabled={loading}>
        {loading ? "Sending..." : "Send"}
      </button>
      {status && (<div className="text-sm text-slate-700">{status}</div>)}
    </form>
  );
}

