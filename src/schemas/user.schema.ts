import { z } from "zod";

export const userSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
    .email("Invalid email address")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email format is not valid"),
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  avatarUrl: z.string().url("Avatar must be a valid URL").optional().nullable(),
  loginAttempts: z.number().optional(),
  lockedUntil: z.date().optional().nullable(),
  preferences: z.object({
    theme: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  deletedAt: z.date().optional().nullable(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
