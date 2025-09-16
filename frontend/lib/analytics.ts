import type { Order } from "./api";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "";

export const isAnalyticsEnabled = Boolean(GA_MEASUREMENT_ID);

declare global {
  interface Window {
    dataLayer?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
    __alnoorAnalyticsReady?: boolean;
  }
}

function sendGtag(...args: any[]) {
  if (!isAnalyticsEnabled) {
    return;
  }
  if (typeof window === "undefined") {
    return;
  }
  if (typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

export function trackPageView(path: string) {
  if (!path) {
    return;
  }
  sendGtag("event", "page_view", {
    page_path: path,
  });
}

export function trackContactSubmission(formId: string) {
  sendGtag("event", "generate_lead", {
    form_id: formId,
  });
}

export function trackPurchase(order: Pick<Order, "id" | "total_amount" | "items" | "source">) {
  if (!order) {
    return;
  }
  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        item_id: String(item.product_id),
        item_name: item.name,
        quantity: item.quantity,
        price: item.price_each,
      }))
    : undefined;
  sendGtag("event", "purchase", {
    transaction_id: String(order.id),
    value: order.total_amount,
    currency: "USD",
    ...(order.source ? { affiliation: order.source } : {}),
    ...(items ? { items } : {}),
  });
}

export function getSearchConsoleVerification(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
}
