// utils/token.js
// DEPRECATED: this file was used for a custom JWT implementation.
// The project now uses NextAuth for authentication. Keep these
// stub exports to avoid runtime import errors while the codebase
// is migrated. Do not use these functions.

export function signAccessToken() {
  throw new Error("Deprecated: signAccessToken removed. Use NextAuth instead.");
}

export function signRefreshToken() {
  throw new Error("Deprecated: signRefreshToken removed. Use NextAuth instead.");
}

export function verifyAccessToken() {
  throw new Error("Deprecated: verifyAccessToken removed. Use NextAuth getToken instead.");
}

export function verifyRefreshToken() {
  throw new Error("Deprecated: verifyRefreshToken removed. Use NextAuth instead.");
}
