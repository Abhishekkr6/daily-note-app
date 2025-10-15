import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes that do not require authentication
const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/api/users/login",
  "/api/users/signup",
  // ...existing code...
  "/api/users/forgotpassword",
  "/api/users/resetpassword"
];

// Helper to check if route is public
function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("authToken")?.value || request.headers.get("Authorization");
  // Daily logout logic: if token exists, check its iat (issued at) date
  if (token) {
    try {
      // Decode JWT without verifying signature (for iat)
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.iat) {
        const issuedDate = new Date(payload.iat * 1000);
        const now = new Date();
        // If token was issued on a previous day, force logout
        if (
          issuedDate.getUTCFullYear() !== now.getUTCFullYear() ||
          issuedDate.getUTCMonth() !== now.getUTCMonth() ||
          issuedDate.getUTCDate() !== now.getUTCDate()
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/login";
          // Clear cookies
          const response = NextResponse.redirect(url);
          response.cookies.set("authToken", "", { maxAge: 0, path: "/" });
          response.cookies.set("refreshToken", "", { maxAge: 0, path: "/api/users/refresh-token" });
          return response;
        }
      }
    } catch (err) {
      // If token is invalid, ignore and continue
    }
  }

  // If authenticated, block access to login, signup, landing
  if (token && ["/login", "/signup", "/landing"].some(route => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Allow public routes for unauthenticated users
  if (!token && isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Block access to protected routes for unauthenticated users
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  // Optionally, verify token validity here (e.g., JWT verification)
  // If invalid, redirect to /login

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_static|favicon.ico|api).*)"
  ]
};
