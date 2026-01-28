import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// List of public routes that do not require authentication
const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
];

const isPublicRoute = (path: string) => PUBLIC_ROUTES.some(route => path.startsWith(route));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let sessionToken = null;
  try {
    sessionToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  } catch (err) {
    // Session token verify failed, treat as unauthenticated
  }

  const isAuthenticated = !!sessionToken;

  if (isAuthenticated && ["/login", "/signup", "/landing"].some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/landing", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except NextAuth, _next, static files, PWA files, etc.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*\\.js|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.mp3|.*\\.wav|.*\\.md).*)"
  ]
};


