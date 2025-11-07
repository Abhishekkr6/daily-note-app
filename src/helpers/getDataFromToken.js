// helpers/getDataFromToken.js
// DEPRECATED helper: replaced by NextAuth's getToken from 'next-auth/jwt'.
// Keep a stub to avoid import-time crashes during migration.

export const getDataFromToken = () => {
  throw new Error(
    "Deprecated: getDataFromToken is removed. Use getToken from 'next-auth/jwt' instead."
  );
};