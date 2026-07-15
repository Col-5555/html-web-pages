import * as authService from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validators.js";

// Registration. The register *validator middleware* has already checked and
// sanitised the body (available on req.validated.body). The controller just adds
// the role and delegates to the service.
export const register = (role) => async (req, res) => {
  const user = await authService.register({ ...req.validated.body, role });
  res.status(201).json({ message: `${role} registered`, user });
};

// Login. Per the brief, login data is validated *inside the controller* rather
// than by a route middleware — so we run the Joi schema here.
export const login = (role) => async (req, res) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  const session = await authService.login({ ...value, role });
  res.status(200).json(session);
};
