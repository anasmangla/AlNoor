import { NextResponse } from "next/server";

const COOKIE_NAME = "alnoor_token";
const ONE_DAY_SECONDS = 60 * 60 * 24;

function resolveBackendBase(): string {
  const candidates = [
    process.env.AUTH_BACKEND_URL,
    process.env.API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ];
  for (const candidate of candidates) {
    if (candidate && !candidate.startsWith("/")) {
      return candidate;
    }
  }
  return process.env.AUTH_BACKEND_FALLBACK || "http://localhost:8000";
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}

async function parseBackendError(res: Response): Promise<string> {
  let message = `Authentication failed (${res.status})`;
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
    // ignore
  }
  return message;
}

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = String(body?.username || "").trim();
  const password = String(body?.password || "").trim();
  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  const backendBase = resolveBackendBase();
  if (!/^https?:\/\//i.test(backendBase)) {
    return NextResponse.json(
      { error: "Backend base URL must be absolute" },
      { status: 500 }
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(joinUrl(backendBase, "auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach authentication service" },
      { status: 502 }
    );
  }

  if (!backendResponse.ok) {
    const message = await parseBackendError(backendResponse);
    return NextResponse.json({ error: message }, { status: backendResponse.status });
  }

  let data: any;
  try {
    data = await backendResponse.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid authentication response" },
      { status: 502 }
    );
  }

  const token = String(data?.access_token || "");
  if (!token) {
    return NextResponse.json(
      { error: "Authentication response missing token" },
      { status: 502 }
    );
  }

  const response = NextResponse.json({ success: true });
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_DAY_SECONDS,
    path: "/",
    ...(domain ? { domain } : {}),
  });
  return response;
}
