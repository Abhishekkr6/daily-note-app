// utils/token.js
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

export function signAccessToken(payload, expiresIn = ACCESS_TOKEN_EXPIRY) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn,
    audience: "user",
    issuer: "daily-note-app",
  });
}

export function signRefreshToken(payload, expiresIn = REFRESH_TOKEN_EXPIRY) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
    audience: "user",
    issuer: "daily-note-app",
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
