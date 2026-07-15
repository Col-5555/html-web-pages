import { z } from "zod";

// Validation rules for the sign-up form. react-hook-form uses this schema
// (via @hookform/resolvers/zod) to validate every field and produce the error
// messages rendered under each input.
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});
