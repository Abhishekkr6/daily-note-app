import { z } from "zod";

// Removed: password-based login schema. Kept minimal for compatibility.
export const loginSchema = z.object({});

export type LoginSchemaType = z.infer<typeof loginSchema>;
