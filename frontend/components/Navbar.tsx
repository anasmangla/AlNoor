"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import ApiStatus from "@/components/ApiStatus";
import { useCart } from "@/context/CartContext";
import { fetchSession, logout as logoutSession } from "@/lib/api";
import { toAppPath } from "@/lib/routing";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/halal-process", label: "Halal Process" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { lines, total } = useCart();
  const count = lines.reduce((acc, line) => acc + line.quantity, 0);
  const formattedCount = count.toFixed(0);
  const formattedTotal = total.toFixed(2);
  const [hasToken, setHasToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const adminLinks = useMemo(
    () =>
      hasToken
        ? [
            { href: "/admin/dashboard", label: "Dashboard" },
            { href: "/admin/products", label: "Admin Products" },
            { href: "/admin/orders", label: "Orders" },
            { href: "/admin/pos", label: "POS" },
            { href: "/admin/messages", label: "Messages" },
            { href: "/admin/settings", label: "Settings" },
          ]
        : [{ href: "/admin/login", label: "Admin" }],
    [hasToken],
  );

  async function logout() {
    setMenuOpen(false);
    try {
      await logoutSession();
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setHasToken(false);
      if (typeof window !== "undefined") {
        window.location.href = toAppPath("/");
      }
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Image src="/alnoorlogo.png" alt="Al Noor" width={24} height={24} />
            <span className="font-heading text-brand text-lg leading-none">Al Noor</span>
          </Link>
          <div className="hidden md:flex items-center gap-3 text-sm">
            {primaryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-brand hover:text-brand-dark hover:underline"
              >
                {item.label}
              </Link>
            ))}
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-brand hover:text-brand-dark hover:underline"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-brand hover:text-brand-dark hover:underline">
            Cart
            <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full bg-brand text-white px-2 py-0.5">
              {formattedCount}
            </span>
          </Link>
          <div className="hidden sm:block text-sm text-brand font-heading">
            ${formattedTotal}
          </div>
          {hasToken && (
            <button
              type="button"
              onClick={logout}
              className="text-brand hover:text-brand-dark hover:underline text-sm"
            >
              Logout
            </button>
          )}
          <button
            type="button"
            className="md:hidden text-sm text-brand hover:text-brand-dark"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div id="mobile-nav" className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 grid gap-4">
            <div className="grid gap-2">
              {primaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="grid gap-2">
              {adminLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-slate-700 hover:underline"
                >
                  {item.label}
                </Link>
              ))}
              {hasToken && (
                <button
                  type="button"
                  onClick={logout}
                  className="text-left text-sm text-slate-600 hover:underline"
                >
                  Logout
                </button>
              )}
            </div>
            <div className="grid gap-2">
              <Link
                href="/cart"
                className="flex items-center justify-between text-slate-700 hover:underline"
              >
                <span>
                  Cart
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                    {formattedCount}
                  </span>
                </span>
                <span className="text-sm text-slate-500">${formattedTotal}</span>
              </Link>
              <Link href="/checkout" className="text-slate-700 hover:underline">
                Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
      <ApiStatus />
    </header>
  );
}
