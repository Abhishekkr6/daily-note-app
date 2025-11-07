import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of public routes that do not require authentication
const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/signup",
  "/forgot-password",
  // Note: password reset and legacy password APIs have been removed in OAuth-only mode
  // if you re-enable password flows, re-add the routes here.
];

// Helper to check if route is public
function isPublicRoute(path: string) {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Prefer NextAuth token for session detection (works for JWT session strategy)
  let sessionToken = null;
  try {
    sessionToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  } catch (err) {
    // ignore
  }

  const isAuthenticated = !!sessionToken;

  // If authenticated, block access to login, signup, landing
  if (
    isAuthenticated &&
    ["/login", "/signup", "/landing"].some((route) => pathname.startsWith(route))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Allow public routes for unauthenticated users
  if (!isAuthenticated && isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Block access to protected routes for unauthenticated users
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|_static|favicon.ico|api).*)"
  ]
};


