import { Suspense } from "react";

function ConfirmationInner() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const orderId = params.get("orderId");
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Thank You!</h1>
      <p className="text-slate-700 mb-4">Your order has been placed.</p>
      {orderId && (
        <p className="text-slate-600">Order ID: <span className="font-medium">{orderId}</span></p>
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

