import { z } from "zod";

export const loginSchema = z.object({
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
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
