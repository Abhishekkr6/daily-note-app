// utils/csrf.js
import crypto from "crypto";

export function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyCSRFToken(requestToken, cookieToken) {
  return requestToken && cookieToken && requestToken === cookieToken;
}
