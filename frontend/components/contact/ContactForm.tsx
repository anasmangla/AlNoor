"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusKey, setStatusKey] = useState<string | null>(null);
  const { t } = useLanguage();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatusKey(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatusKey("contactForm.success");
      setName(""); setEmail(""); setPhone(""); setMessage("");
    } catch (err) {
      setStatusKey("contactForm.error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3" aria-live="polite">
      <div>
        <label className="block text-sm text-slate-600" htmlFor="cname">{t("contactForm.nameLabel")}</label>
        <input
          id="cname"
          className="border rounded px-2 py-1 w-full"
          value={name}
          onChange={(e)=> setName(e.target.value)}
          placeholder={t("contactForm.namePlaceholder")}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600" htmlFor="cemail">{t("contactForm.emailLabel")}</label>
          <input
            id="cemail"
            type="email"
            className="border rounded px-2 py-1 w-full"
            value={email}
            onChange={(e)=> setEmail(e.target.value)}
            placeholder={t("contactForm.emailPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600" htmlFor="cphone">{t("contactForm.phoneLabel")}</label>
          <input
            id="cphone"
            className="border rounded px-2 py-1 w-full"
            value={phone}
            onChange={(e)=> setPhone(e.target.value)}
            placeholder={t("contactForm.phonePlaceholder")}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600" htmlFor="cmsg">{t("contactForm.messageLabel")}</label>
        <textarea
          id="cmsg"
          className="border rounded px-2 py-1 w-full"
          rows={4}
          value={message}
          onChange={(e)=> setMessage(e.target.value)}
          placeholder={t("contactForm.messagePlaceholder")}
          required
        />
      </div>
      <button type="submit" className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 disabled:opacity-60" disabled={loading} aria-busy={loading}>
        {loading ? t("contactForm.sending") : t("contactForm.send")}
      </button>
      {statusKey && (<div className="text-sm text-slate-700">{t(statusKey)}</div>)}
    </form>
  );
}
