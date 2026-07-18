import Joi from "joi";

// General profile info that Coders and Managers can update (first name, last
// name, about). At least one field must be present so a PATCH actually changes
// something. Used by the manager route (JSON only).
export const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50),
  about: Joi.string().max(500).allow(""),
})
  .min(1)
  .messages({ "object.min": "Provide at least one field to update" });

// Coder profile update, submitted as multipart/form-data (so the avatar file can
// ride along). The file itself isn't in the body — Multer puts it on req.file —
// so, unlike the manager schema, we DON'T require .min(1): an avatar-only update
// legitimately has an empty text body.
export const updateCoderProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50),
  last_name: Joi.string().min(2).max(50),
  about: Joi.string().max(500).allow(""),
});
