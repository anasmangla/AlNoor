export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  unit: string;
  is_weight_based: boolean;
  image_url?: string;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

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
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create product: ${res.status}`);
  return res.json();
}

// Auth
export async function login(
  username: string,
  password: string
): Promise<{ access_token: string; token_type: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
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

export async function listOrders(): Promise<Order[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/orders`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to list orders: ${res.status}`);
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  status: string
): Promise<Order> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update order: ${res.status}`);
  return res.json();
}

// POS Terminal (Square) — optional
export type TerminalCheckout = { checkout_id: string; status: string; url?: string };

export async function createTerminalCheckout(args: {
  amount_cents: number;
  device_id?: string;
  reference_id?: string;
}): Promise<TerminalCheckout> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/pos/terminal/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(`Terminal checkout failed: ${res.status}`);
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

export async function listMessages(): Promise<ContactMessage[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/admin/messages`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to list messages: ${res.status}`);
  return res.json();
}

export async function deleteMessage(id: number): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
    method: "DELETE",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(`Failed to delete message: ${res.status}`);
}

export async function pollTerminalCheckout(id: string): Promise<TerminalCheckout> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/pos/terminal/checkout/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
  return res.json();
}

export async function getOrder(id: number): Promise<Order> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to get order: ${res.status}`);
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Failed to delete product: ${res.status}`);
}

export async function updateProduct(
  id: number,
  input: Partial<Omit<Product, "id">>
): Promise<Product> {
  const token = typeof window !== "undefined" ? localStorage.getItem("alnoor_token") : null;
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update product: ${res.status}`);
  return res.json();
}
