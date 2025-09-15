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
      </nav>
      <ApiStatus />
    </header>
  );
}
