import { z } from "zod";

// Validation for the challenge form (react-hook-form + zod). Mirrors the shape
// stored on json-server: the left pane's details + markdown description, the
// right pane's function name + starter code, and the dynamic tests list.

// A single test case. `type` tags whether the value/output are numbers or
// strings; `weight` is a 0..1 float used when grading. Value/output stay as
// strings in the inputs — the manager types them freely.
export const testSchema = z.object({
  type: z.enum(["number", "string"]),
  name: z.string().min(1, "Test name is required"),
  value: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Expected output is required"),
  weight: z.coerce
    .number({ message: "Weight must be a number" })
    .min(0, "Weight must be between 0 and 1")
    .max(1, "Weight must be between 0 and 1"),
});

export const challengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["Easy", "Moderate", "Hard"]),
  description: z.string().min(1, "Description is required"),
  functionName: z.string().min(1, "Function name is required"),
  body: z.string(),
  tests: z.array(testSchema),
});
