import { NextResponse } from "next/server";
import { generateCSRFToken } from "@/utils/csrf";

export async function GET() {
  const csrfToken = generateCSRFToken();
  const response = NextResponse.json({ csrfToken });
  // If your frontend and API are served from different origins in production
  // you must set sameSite: 'none' and secure: true so the browser will accept
  // and send the cookie in cross-site contexts. For local development keep
  // sameSite as 'lax' to avoid issues.
  response.cookies.set("csrfToken", csrfToken, {
    httpOnly: false, // must be readable by JS for double-submit
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return response;
}
