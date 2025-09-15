"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string; type?: "success" | "error" | "info" };
type ToastContextType = {
  show: (message: string, type?: Toast["type"]) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), 2500);
  }, [remove]);

  const value = useMemo<ToastContextType>(() => ({
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 z-[9999] grid gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={
              "px-3 py-2 rounded shadow text-sm " +
              (t.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : t.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-slate-50 border border-slate-200 text-slate-800")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
