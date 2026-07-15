import Joi from "joi";

// Account registration payload. Applied as validator middleware on the register
// routes (per the brief: "Apply the account registration validator ... using Joi").
export const registerSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

// Account login payload. The brief asks for this to be validated *inside the
// controller*, so it's exported as a plain schema (not wired as middleware).
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});
