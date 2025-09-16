"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function ApiStatus() {
  const [down, setDown] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const { t } = useLanguage();
  useEffect(() => {
    let cancelled = false;
    async function ping() {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        if (!base) return; // no API configured
        const res = await fetch(`${base}/health`, { cache: "no-store" });
        if (!cancelled) setDown(!res.ok);
        if (!res.ok) setMsg(`API ${res.status}`);
      } catch (e: any) {
        if (!cancelled) {
          setDown(true);
          setMsg(e?.message || "API unreachable");
        }
      }
    }
    ping();
    const id = setInterval(ping, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!down) return null;
  return (
    <div className="bg-red-50 border-t border-red-200 text-red-700 text-sm">
      <div className="max-w-5xl mx-auto px-6 py-2">{t("apiStatus.unreachable", { msg })}</div>
    </div>
  );
}

