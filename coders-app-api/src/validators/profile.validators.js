import Joi from "joi";

// General profile info that Coders and Managers can update (first name, last
// name, about). Avatar updates are a later assignment. At least one field must
// be present so a PATCH actually changes something.
export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50),
  about: Joi.string().max(500).allow(""),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });
