import { z } from "zod";

// Removed: password-based signup schema. Kept minimal for compatibility.
export const signupSchema = z.object({});

export type SignupSchemaType = z.infer<typeof signupSchema>;
