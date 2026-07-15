import Joi from "joi";

// Code submission sent to the grader. Shape per the brief: the coder's code as
// text, the language (only py/js are supported by the code runner), and the id
// of the challenge being solved.
export const submissionSchema = Joi.object({
  lang: Joi.string().valid("py", "js").required(),
  code: Joi.string().min(1).required(),
  challenge_id: Joi.string().min(1).required(),
});
