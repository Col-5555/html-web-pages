import Joi from "joi";

// `?k` for the top-k coders endpoint: a required positive integer.
export const topKQuerySchema = Joi.object({
  k: Joi.number().integer().min(1).required(),
});
