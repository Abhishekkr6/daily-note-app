import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string({
    required_error: "Token is required",
    invalid_type_error: "Token must be a string",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
    .min(6, "Password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, "Password must contain at least one letter and one number"),
  confirmPassword: z.string({
    required_error: "Confirm password is required",
    invalid_type_error: "Confirm password must be a string",
  })
    .min(6, "Confirm password must be at least 6 characters")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, "Confirm password must contain at least one letter and one number"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
