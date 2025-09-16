"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ApiStatus from "@/components/ApiStatus";
import { fetchSession, logout as logoutSession } from "@/lib/api";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { lines, total } = useCart();
  const count = lines.reduce((acc, l) => acc + l.quantity, 0);
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

  async function logout() {
    try {
      await logoutSession();
    } catch (err) {
      console.error("Failed to log out", err);
    } finally {
      setHasToken(false);
      setMenuOpen(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Image src="/alnoorlogo.png" alt="Al Noor" width={24} height={24} />
              <span className="font-semibold">Al Noor</span>
            </Link>
            <div className="hidden sm:flex items-center gap-3 flex-wrap text-sm">
              <Link href="/products" className="text-slate-700 hover:underline">
                Products
              </Link>
              <Link href="/contact" className="text-slate-700 hover:underline">
                Contact
              </Link>
              <Link href="/checkout" className="text-slate-700 hover:underline">
                Checkout
              </Link>
              {hasToken ? (
                <>
                  <Link href="/admin/dashboard" className="text-slate-700 hover:underline">
                    Dashboard
                  </Link>
                  <Link href="/admin/products" className="text-slate-700 hover:underline">
                    Admin Products
                  </Link>
                  <Link href="/admin/orders" className="text-slate-700 hover:underline">
                    Orders
                  </Link>
                  <Link href="/admin/pos" className="text-slate-700 hover:underline">
                    POS
                  </Link>
                  <Link href="/admin/messages" className="text-slate-700 hover:underline">
                    Messages
                  </Link>
                  <Link href="/admin/settings" className="text-slate-700 hover:underline">
                    Settings
                  </Link>
                </>
              ) : (
                <Link href="/admin/login" className="text-slate-700 hover:underline">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/cart" className="inline-flex items-center gap-1 hover:underline">
              <span>Cart</span>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                {count.toFixed(0)}
              </span>
            </Link>
            <div className="text-sm text-slate-600">${total.toFixed(2)}</div>
            {hasToken && (
              <button onClick={logout} className="text-slate-600 hover:underline">
                Logout
              </button>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded border border-slate-300 p-2 text-slate-700 transition sm:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            <span className="sr-only">Toggle navigation</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div
          id="primary-navigation"
          className={`${menuOpen ? "grid" : "hidden"} sm:hidden mt-3 gap-3 border-t border-slate-200 pt-3 text-sm`}
        >
          <div className="grid gap-2">
            <Link href="/products" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            <Link href="/contact" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            <Link href="/checkout" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
              Checkout
            </Link>
            {hasToken ? (
              <>
                <Link href="/admin/dashboard" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/admin/products" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  Admin Products
                </Link>
                <Link href="/admin/orders" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <Link href="/admin/pos" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  POS
                </Link>
                <Link href="/admin/messages" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  Messages
                </Link>
                <Link href="/admin/settings" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                  Settings
                </Link>
              </>
            ) : (
              <Link href="/admin/login" className="text-slate-700 hover:underline" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
          </div>
          <div className="grid gap-2">
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 rounded border border-slate-200 px-3 py-2 hover:bg-slate-50"
              onClick={() => setMenuOpen(false)}
            >
              <span>Cart</span>
              <span className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                {count.toFixed(0)}
              </span>
            </Link>
            <div className="text-sm text-slate-600">Total: ${total.toFixed(2)}</div>
            {hasToken && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="text-left text-slate-600 hover:underline"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      <ApiStatus />
    </header>
  );
}
