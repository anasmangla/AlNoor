"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ApiStatus from "@/components/ApiStatus";
import { useCart } from "@/context/CartContext";
import { fetchSession, logout as logoutSession } from "@/lib/api";

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

  const formattedCount = count.toFixed(0);
  const formattedTotal = total.toFixed(2);

  async function logout() {
    setMenuOpen(false);
    try {
      await logoutSession();
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setHasToken(false);
      setMenuOpen(false);
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
            <span className="font-heading text-brand text-lg leading-none">Al Noor</span>
          </Link>

          <Link href="/products" className="text-brand hover:text-brand-dark hover:underline">Products</Link>
          <Link href="/contact" className="text-brand hover:text-brand-dark hover:underline">Contact</Link>
          <Link href="/checkout" className="text-brand hover:text-brand-dark hover:underline">Checkout</Link>
          {hasToken ? (
            <>
              <Link href="/admin/dashboard" className="text-brand hover:text-brand-dark hover:underline">Dashboard</Link>
              <Link href="/admin/products" className="text-brand hover:text-brand-dark hover:underline">Admin Products</Link>
              <Link href="/admin/orders" className="text-brand hover:text-brand-dark hover:underline">Orders</Link>
              <Link href="/admin/pos" className="text-brand hover:text-brand-dark hover:underline">POS</Link>
              <Link href="/admin/messages" className="text-brand hover:text-brand-dark hover:underline">Messages</Link>
              <Link href="/admin/settings" className="text-brand hover:text-brand-dark hover:underline">Settings</Link>
            </>
          ) : (
            <Link href="/admin/login" className="text-brand hover:text-brand-dark hover:underline">Admin</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative text-brand hover:text-brand-dark hover:underline">
            Cart
            <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full bg-brand text-white px-2 py-0.5">
              {count.toFixed(0)}
            </span>
          </Link>
          <div className="text-sm text-brand hidden sm:block font-heading">${total.toFixed(2)}</div>
          {hasToken && (
            <button onClick={logout} className="text-brand hover:text-brand-dark hover:underline text-sm">Logout</button>
          )}
        </div>

        {menuOpen && (
          <div className="md:hidden mt-4 border-t border-slate-200 pt-4 grid gap-4">
            <div className="grid gap-2">
              {primaryLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-700 hover:underline">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="grid gap-2">
              {adminLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-slate-700 hover:underline">
                  {item.label}
                </Link>
              ))}
              {hasToken && (
                <button onClick={logout} className="text-left text-sm text-slate-600 hover:underline">
                  Logout
                </button>
              )}
            </div>
            <div className="grid gap-2">
              <Link href="/cart" className="flex items-center justify-between text-slate-700 hover:underline">
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
      </nav>
      <ApiStatus />
    </header>
  );
}
