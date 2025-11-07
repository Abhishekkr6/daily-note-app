// middleware/requireRole.js
// DEPRECATED: role-based middleware using custom JWTs.
// The app now uses NextAuth for authentication and authorization.
// Keep a stub to avoid import errors. If you rely on role checks,
// use NextAuth session token and check user.role in your route handlers.

export function requireRole() {
  return function () {
    throw new Error(
      "Deprecated: requireRole middleware removed. Use NextAuth session/getToken and perform role checks inside route handlers."
    );
  };
}
