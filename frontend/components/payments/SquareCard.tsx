"use client";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    Square?: any;
  }
}

type Props = {
  amountCents: number;
  onToken: (token: string) => Promise<void> | void;
  disabled?: boolean;
};

export default function SquareCard({ amountCents, onToken, disabled }: Props) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);

  const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const env = (process.env.NEXT_PUBLIC_SQUARE_ENV || "sandbox").toLowerCase();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        if (!appId || !locationId) {
          setError("Square not configured");
          return;
        }
        if (!window.Square) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = env === "sandbox"
              ? "https://sandbox.web.squarecdn.com/v1/square.js"
              : "https://web.squarecdn.com/v1/square.js";
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("Failed to load Square SDK"));
            document.head.appendChild(s);
          });
        }
        const payments = await window.Square!.payments(appId, locationId);
        paymentsRef.current = payments;
        const card = await payments.card();
        await card.attach("#card-container");
        cardRef.current = card;
        if (!cancelled) setReady(true);
      } catch (e: any) {
        setError(e.message || "Square init failed");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [appId, locationId, env]);

  async function onPay() {
    setError(null);
    try {
      const card = cardRef.current;
      if (!card) return;
      const r = await card.tokenize();
      if (r.status !== "OK") {
        throw new Error(r.errors?.[0]?.message || "Tokenization failed");
      }
      await onToken(r.token);
    } catch (e: any) {
      setError(e.message || "Payment error");
    }
  }

  const amount = (amountCents / 100).toFixed(2);

  return (
    <div className="grid gap-2">
      <div id="card-container" className="border rounded p-3" />
      <button
        type="button"
        onClick={onPay}
        disabled={!ready || disabled}
        className="w-full rounded bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
      >
        Pay ${amount}
      </button>
      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 p-2 rounded text-sm">{error}</div>
      )}
    </div>
  );
}

