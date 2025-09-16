"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ApiStatus from "@/components/ApiStatus";
import { fetchSession, logout as logoutSession } from "@/lib/api";

export default function Navbar() {
  const { lines, total } = useCart();
  const count = lines.reduce((acc, l) => acc + l.quantity, 0);
  const [hasToken, setHasToken] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const baseLinks = [
    { href: "/products", label: "Products" },
    { href: "/contact", label: "Contact" },
    { href: "/checkout", label: "Checkout" },
  ];

  const adminLinks = hasToken
    ? [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/products", label: "Admin Products" },
        { href: "/admin/orders", label: "Orders" },
        { href: "/admin/pos", label: "POS" },
        { href: "/admin/messages", label: "Messages" },
        { href: "/admin/settings", label: "Settings" },
      ]
    : [{ href: "/admin/login", label: "Admin" }];

  const navLinks = [...baseLinks, ...adminLinks];

  async function logout() {
    setMenuOpen(false);
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
      <nav className="relative max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Image src="/alnoorlogo.png" alt="Al Noor" width={24} height={24} />
            <span className="font-semibold">Al Noor</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-slate-700 hover:underline">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 hover:bg-slate-100"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className={`h-5 w-5 transition-transform duration-200 ${menuOpen ? "rotate-90" : "rotate-0"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/cart" className="relative hover:underline">
            Cart
            <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full bg-emerald-600 text-white px-2 py-0.5">
              {count.toFixed(0)}
            </span>
          </Link>
          <div className="text-sm text-slate-600 hidden sm:block">${total.toFixed(2)}</div>
          {hasToken && (
            <button onClick={logout} className="text-slate-600 hover:underline text-sm">Logout</button>
          )}
        </div>
        <div
          id="mobile-menu"
          className={`md:hidden absolute inset-x-0 top-full mt-2 px-6 transition-all duration-200 ease-out transform z-20 ${
            menuOpen
              ? "pointer-events-auto opacity-100 translate-y-0"
              : "pointer-events-none opacity-0 -translate-y-2"
          }`}
          aria-hidden={!menuOpen}
        >
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-slate-700 transition-colors hover:bg-slate-100"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <ApiStatus />
    </header>
  );
}
