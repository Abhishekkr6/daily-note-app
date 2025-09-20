import { z } from "zod";

export const userSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
    .email("Invalid email address")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email format is not valid"),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, "Password must contain at least one letter and one number"),
  username: z.string({
    required_error: "Username is required",
    invalid_type_error: "Username must be a string",
  }).min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters"),
  avatarUrl: z.string().url("Avatar must be a valid URL").optional().nullable(),
  loginAttempts: z.number().optional(),
  lockedUntil: z.date().optional().nullable(),
  preferences: z.object({
    theme: z.string().optional(),
    timezone: z.string().optional(),
  }).optional(),
  resetPasswordToken: z.string().optional().nullable(),
  resetPasswordExpires: z.date().optional().nullable(),
  deletedAt: z.date().optional().nullable(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
