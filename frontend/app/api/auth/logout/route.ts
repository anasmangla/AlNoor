import { NextResponse } from "next/server";

const COOKIE_NAME = "alnoor_token";

export async function POST() {
  const response = NextResponse.json({ success: true });
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    ...(domain ? { domain } : {}),
  });
  return response;
}
