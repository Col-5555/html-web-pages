// Reusable Joi validation middleware. Given a schema and which part of the
// request to check ("body" by default, or "query" / "params"), it validates
// that part and either responds 400 with all the collected messages or calls
// next() after stashing the sanitised value on `req.validated`.
//
//   router.post("/register", validate(registerSchema), controller.register);
//   router.get("/top", validate(topKSchema, "query"), controller.top);
//
// In Express 5 `req.query` is a read-only getter, so we don't overwrite the
// request part; instead controllers read the cleaned, type-coerced values from
// `req.validated[part]` (e.g. `req.validated.body`, `req.validated.query`).
export const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // collect every error, not just the first
      stripUnknown: true, // drop fields the schema doesn't declare
    });

    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });
    }

    req.validated = { ...(req.validated || {}), [property]: value };
    next();
  };
