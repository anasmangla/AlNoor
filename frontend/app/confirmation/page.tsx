"use client";

import { Suspense } from "react";
import { useLanguage } from "@/context/LanguageContext";

function ConfirmationInner() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const orderId = params.get("orderId");
  const { t } = useLanguage();
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">{t("confirmation.title")}</h1>
      <p className="text-slate-700 mb-4">{t("confirmation.subtitle")}</p>
      {orderId && (
        <p className="text-slate-600">
          {t("confirmation.orderId")}: <span className="font-medium">{orderId}</span>
        </p>
      )}
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <section>
      <Suspense>
        <ConfirmationInner />
      </Suspense>
    </section>
  );
}

