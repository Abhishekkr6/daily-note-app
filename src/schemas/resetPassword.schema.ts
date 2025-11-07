import { z } from "zod";

// Deprecated: password reset flow removed in OAuth-only migration.
// Keep a minimal, empty schema to avoid import-time errors in older references.
// Removed: password reset schema. Kept minimal to avoid import-time errors.
export const resetPasswordSchema = z.object({});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
