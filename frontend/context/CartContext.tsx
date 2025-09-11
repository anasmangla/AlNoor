"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/api";

export type CartLine = { product: Product; quantity: number };

type CartState = {
  lines: CartLine[];
  add: (product: Product, quantity: number) => void;
  update: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartState | undefined>(undefined);

const STORAGE_KEY = "alnoor_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  // Load from localStorage on client
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setLines(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      }
    } catch {}
  }, [lines]);

  function add(product: Product, quantity: number) {
    setLines((prev) => {
      const q = Math.max(0, Number(quantity) || 0);
      if (q <= 0) return prev;
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + q } : l
        );
      }
      return [...prev, { product, quantity: q }];
    });
  }

  function update(productId: number, quantity: number) {
    setLines((prev) => {
      const q = Math.max(0, Number(quantity) || 0);
      if (q <= 0) return prev.filter((l) => l.product.id !== productId);
      return prev.map((l) => (l.product.id === productId ? { ...l, quantity: q } : l));
    });
  }

  function remove(productId: number) {
    setLines((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function clear() {
    setLines([]);
  }

  const total = useMemo(
    () => lines.reduce((acc, l) => acc + l.product.price * l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({ lines, add, update, remove, clear, total }),
    [lines, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

