// utils/rateLimit.js
// Simple in-memory rate limiter (for demo; use Redis for prod)
const rateLimitStore = {};
const WINDOW_SIZE = 15 * 60 * 1000; // 15 min
const MAX_REQUESTS = 10; // per window per IP

export function rateLimit(ip) {
  const now = Date.now();
  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = [];
  }
  // Remove old requests
  rateLimitStore[ip] = rateLimitStore[ip].filter(ts => now - ts < WINDOW_SIZE);
  if (rateLimitStore[ip].length >= MAX_REQUESTS) {
    return false;
  }
  rateLimitStore[ip].push(now);
  return true;
}
