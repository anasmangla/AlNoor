import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "alnoor_token";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const response = NextResponse.json({ authenticated: Boolean(token) });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
