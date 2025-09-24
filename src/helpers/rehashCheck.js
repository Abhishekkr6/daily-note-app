// Helper to check if a bcrypt hash needs rehashing (for future upgrades)
import bcrypt from "bcryptjs";

export function needsRehash(hash, currentSaltRounds = 12) {
  // bcrypt hash format: $2[abxy]$[cost]$...
  const match = hash.match(/^\$2[abxy]\$(\d{2})\$/);
  if (!match) return true; // Not a valid bcrypt hash
  const rounds = parseInt(match[1], 10);
  return rounds < currentSaltRounds;
}