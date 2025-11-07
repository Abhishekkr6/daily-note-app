// Removed: rehash helper not needed in OAuth-only configuration.
// Keep a tiny stub to avoid breaking imports in older code.
export function needsRehash() {
  return false;
}