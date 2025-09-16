"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ApiStatus from "@/components/ApiStatus";
import { fetchSession, logout as logoutSession } from "@/lib/api";
import { useLanguage, supportedLanguages } from "@/context/LanguageContext";
import type { SupportedLanguage } from "@/lib/translations";

export default function Navbar() {
  const { lines, total } = useCart();
  const count = lines.reduce((acc, l) => acc + l.quantity, 0);
  const [hasToken, setHasToken] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    let active = true;
    fetchSession()
      .then((session) => {
        if (active) setHasToken(Boolean(session?.authenticated));
      })
      .catch(() => {
        if (active) setHasToken(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function logout() {
    try {
      await logoutSession();
    } catch (err) {
      console.error("Failed to log out", err);
    } finally {
      setHasToken(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Image src="/alnoorlogo.png" alt="Al Noor" width={24} height={24} />
            <span className="font-semibold">Al Noor</span>
          </Link>
          <Link href="/products" className="text-slate-700 hover:underline">{t("nav.products")}</Link>
          <Link href="/contact" className="text-slate-700 hover:underline">{t("nav.contact")}</Link>
          <Link href="/checkout" className="text-slate-700 hover:underline">{t("nav.checkout")}</Link>
          {hasToken ? (
            <>
              <Link href="/admin/dashboard" className="text-slate-700 hover:underline">{t("nav.dashboard")}</Link>
              <Link href="/admin/products" className="text-slate-700 hover:underline">{t("nav.adminProducts")}</Link>
              <Link href="/admin/orders" className="text-slate-700 hover:underline">{t("nav.orders")}</Link>
              <Link href="/admin/pos" className="text-slate-700 hover:underline">{t("nav.pos")}</Link>
              <Link href="/admin/messages" className="text-slate-700 hover:underline">{t("nav.messages")}</Link>
              <Link href="/admin/settings" className="text-slate-700 hover:underline">{t("nav.settings")}</Link>
            </>
          ) : (
            <Link href="/admin/login" className="text-slate-700 hover:underline">{t("nav.admin")}</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <label className="sr-only" htmlFor="language-select">
            {t("nav.language")}
          </label>
          <select
            id="language-select"
            className="border rounded px-2 py-1 text-sm"
            value={language}
            onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
          >
            {supportedLanguages.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Link href="/cart" className="relative hover:underline">
            {t("nav.cart")}
            <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full bg-emerald-600 text-white px-2 py-0.5">
              {count.toFixed(0)}
            </span>
          </Link>
          <div className="text-sm text-slate-600 hidden sm:block">${total.toFixed(2)}</div>
          {hasToken && (
            <button onClick={logout} className="text-slate-600 hover:underline text-sm">
              {t("nav.logout")}
            </button>
          )}
        </div>
      </nav>
      <ApiStatus />
    </header>
  );
}
