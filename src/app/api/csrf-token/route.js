import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/utils/csrf";

export async function GET() {
  const csrfToken = generateCSRFToken();
  const response = NextResponse.json({ csrfToken });
  response.cookies.set("csrfToken", csrfToken, {
    httpOnly: false, // must be readable by JS for double-submit
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return response;
}
