import Joi from "joi";

// Supported code-runner languages (per the grading brief).
const LANGUAGES = ["py", "js"];

// A single line of starter/reference code for one language.
const codeTextSchema = Joi.object({
  language: Joi.string()
    .valid(...LANGUAGES)
    .required(),
  text: Joi.string().allow("").required(),
});

// A named function input (the parameter list of the challenge's function).
const inputSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().min(1).required(),
});

// A single test case: weighted, with named input values and an expected output.
// `value`/`output` are `any` because they can be numbers, strings, arrays, etc.
const testSchema = Joi.object({
  weight: Joi.number().min(0).max(1).required(),
  inputs: Joi.array()
    .items(Joi.object({ name: Joi.string().min(1).required(), value: Joi.any().required() }))
    .required(),
  output: Joi.any().required(),
});

// Challenge creation payload — matches the brief's example exactly.
export const createChallengeSchema = Joi.object({
  title: Joi.string().min(1).required(),
  category: Joi.string().min(1).required(),
  description: Joi.string().min(1).required(), // markdown
  level: Joi.string().valid("Easy", "Moderate", "Hard").required(),
  code: Joi.object({
    function_name: Joi.string().min(1).required(),
    code_text: Joi.array().items(codeTextSchema).min(1).required(),
    inputs: Joi.array().items(inputSchema).required(),
  }).required(),
  tests: Joi.array().items(testSchema).min(1).required(),
});

// Optional `?category` filter on the challenge list.
export const listChallengesQuerySchema = Joi.object({
  category: Joi.string().min(1),
});
