// utils/totp.js
import crypto from "crypto";

export function generateTOTPSecret() {
  return crypto.randomBytes(20).toString("hex");
}

export function getTOTP(secret, window = 0) {
  // Simple TOTP (RFC 6238) implementation for demo; use speakeasy for prod
  const time = Math.floor(Date.now() / 30000) + window;
  const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
  hmac.update(Buffer.alloc(8).writeBigInt64BE(BigInt(time)));
  const digest = hmac.digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = ((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, "0");
  return code;
}

export function verifyTOTP(token, secret) {
  // Check current, previous, and next window for clock drift
  return (
    token === getTOTP(secret, -1) ||
    token === getTOTP(secret, 0) ||
    token === getTOTP(secret, 1)
  );
}
