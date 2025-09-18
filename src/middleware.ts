import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of public routes that do not require authentication
const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/signup",
  "/api/users/login",
  "/api/users/signup",
  "/api/users/verifyemail",
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
