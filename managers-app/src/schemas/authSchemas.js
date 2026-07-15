import { z } from "zod";

// Validation for the auth forms (react-hook-form + zod), per the brief.

// Sign in: valid email + password of at least 6 characters.
export const signinSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Sign up: names of at least 2 characters, valid email, password >= 6.
export const signupSchema = z.object({
  firstName: z.string().min(2, "String must contain at least 2 character(s)"),
  lastName: z.string().min(2, "String must contain at least 2 character(s)"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
