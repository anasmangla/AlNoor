"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useEffect, useState } from "react";
import ApiStatus from "@/components/ApiStatus";

export default function Navbar() {
  const { lines, total } = useCart();
  const count = lines.reduce((acc, l) => acc + l.quantity, 0);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!localStorage.getItem("alnoor_token"));
    }
  }, []);

  function logout() {
    try {
      localStorage.removeItem("alnoor_token");
      document.cookie = "alnoor_token=; Path=/; Max-Age=0";
      window.location.href = "/";
    } catch {}
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
      <nav className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Image src="/favicon.png" alt="Al Noor" width={24} height={24} />
            <span className="font-semibold">Al Noor</span>
          </Link>
          <Link href="/products" className="text-slate-700 hover:underline">Products</Link>
          <Link href="/checkout" className="text-slate-700 hover:underline">Checkout</Link>
          {hasToken ? (
            <>
              <Link href="/admin/dashboard" className="text-slate-700 hover:underline">Dashboard</Link>
              <Link href="/admin/products" className="text-slate-700 hover:underline">Admin Products</Link>
              <Link href="/admin/orders" className="text-slate-700 hover:underline">Orders</Link>
              <Link href="/admin/pos" className="text-slate-700 hover:underline">POS</Link>
              <Link href="/admin/messages" className="text-slate-700 hover:underline">Messages</Link>
            </>
          ) : (
            <Link href="/admin/login" className="text-slate-700 hover:underline">Admin</Link>
          )}
        </div>
        <div className="flex items-center gap-4">
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
      </nav>
      <ApiStatus />
    </header>
  );
}
