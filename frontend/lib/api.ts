export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  is_weight_based: boolean;
  image_url?: string;
  description?: string;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

async function buildError(
  res: Response,
  fallback: string
): Promise<Error> {
  let message = `${fallback}: ${res.status}`;
  try {
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        const detail =
          typeof data === "string"
            ? data
            : data?.detail || data?.error || data?.message;
        if (typeof detail === "string" && detail.trim()) {
          message = detail;
        } else if (text.trim()) {
          message = text.trim();
        }
      } catch {
        if (text.trim()) {
          message = text.trim();
        }
      }
    }
  } catch {
    // ignore body parse errors
  }
  if (res.status === 401 && !message.includes("401")) {
    message = "401 Unauthorized";
  }
  return new Error(message);
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }
  return res.json();
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch product ${id}: ${res.status}`);
  return res.json();
}

export async function createProduct(input: Omit<Product, "id">): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await buildError(res, "Failed to create product");
  return res.json();
}

// Auth
export async function login(
  username: string,
  password: string
): Promise<void> {
  const res = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw await buildError(res, "Login failed");
}

export async function logout(): Promise<void> {
  const res = await fetch(`/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Logout failed");
}

export async function fetchSession(): Promise<{ authenticated: boolean }> {
  const res = await fetch(`/api/auth/session`, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to fetch session");
  return res.json();
}

// Orders
export type OrderItemInput = { product_id: number; quantity: number };
export type Order = {
  id: number;
  total_amount: number;
  status: string;
  source: string;
  customer_name?: string | null;
  customer_email?: string | null;
  created_at?: string | null;
  items: Array<{
    product_id: number;
    name: string;
    unit: string;
    quantity: number;
    price_each: number;
    subtotal: number;
  }>;
};

export async function createOrder(input: {
  customer_name?: string;
  customer_email?: string;
  items: OrderItemInput[];
  source?: string;
  payment_token?: string;
}): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
  return res.json();
}

export async function listOrders(params?: { startDate?: string; endDate?: string }): Promise<Order[]> {
  const qs = params ? new URLSearchParams({
    ...(params.startDate ? { start_date: params.startDate } : {}),
    ...(params.endDate ? { end_date: params.endDate } : {}),
  }).toString() : "";
  const res = await fetch(`${API_BASE}/orders${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to list orders");
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await buildError(res, "Failed to update order");
  return res.json();
}

// POS Terminal (Square) — optional
export type TerminalCheckout = { checkout_id: string; status: string; url?: string };

export async function createTerminalCheckout(args: {
  amount_cents: number;
  device_id?: string;
  reference_id?: string;
}): Promise<TerminalCheckout> {
  const res = await fetch(`${API_BASE}/pos/terminal/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(args),
  });
  if (!res.ok) throw await buildError(res, "Terminal checkout failed");
  return res.json();
}

// Contact messages
export type ContactMessage = {
  id: number;
  name: string;
  email?: string | null;
  message: string;
  created_at: string;
};

export type VisitorFeedback = {
  id: number;
  name: string;
  email?: string | null;
  rating: number;
  interest?: string | null;
  comments?: string | null;
  created_at: string;
};

export type FeedbackInterestBreakdown = {
  interest: string;
  count: number;
};

export type FeedbackSummary = {
  total_submissions: number;
  average_rating: number | null;
  interest_breakdown: FeedbackInterestBreakdown[];
  last_submission: string | null;
  next_quarterly_review: string;
};

export async function listMessages(): Promise<ContactMessage[]> {
  const res = await fetch(`${API_BASE}/admin/messages`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to list messages");
  return res.json();
}

export async function deleteMessage(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to delete message");
}

export async function submitFeedback(input: {
  name?: string;
  email?: string;
  rating: number;
  interest?: string;
  comments?: string;
}): Promise<VisitorFeedback> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await buildError(res, "Failed to submit feedback");
  return res.json();
}

export async function listFeedbackEntries(): Promise<VisitorFeedback[]> {
  const res = await fetch(`${API_BASE}/admin/feedback`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to list feedback");
  return res.json();
}

export async function deleteFeedbackEntry(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/feedback/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to delete feedback");
}

export async function fetchFeedbackSummary(): Promise<FeedbackSummary> {
  const res = await fetch(`${API_BASE}/admin/feedback/summary`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to load feedback summary");
  return res.json();
}

export async function pollTerminalCheckout(id: string): Promise<TerminalCheckout> {
  const res = await fetch(`${API_BASE}/pos/terminal/checkout/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Poll failed");
  return res.json();
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to get order");
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw await buildError(res, "Failed to delete product");
}

export async function updateProduct(
  id: number,
  input: Partial<Omit<Product, "id">>
): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });
  if (!res.ok) throw await buildError(res, "Failed to update product");
  return res.json();
}
