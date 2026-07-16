import * as authService from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validators.js";

// Registration. The register *validator middleware* has already checked and
// sanitised the body (available on req.validated.body). The controller adds the
// role, delegates to the service, and returns the created (unverified) account.
// `emailPreviewUrl` is the Ethereal preview link in dev (null with real SMTP).
export const register = (role) => async (req, res) => {
  const { user, emailPreviewUrl } = await authService.register({
    ...req.validated.body,
    role,
  });
  res.status(201).json({
    message: `${role} registered — check your email to verify the account`,
    user,
    emailPreviewUrl,
  });
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

// A tiny HTML page for the verification route — the user reaches it by clicking
// the link in their email, so a browser-friendly response is nicer than JSON.
const page = (title, body) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body { font-family: system-ui, sans-serif; background:#0f172a; color:#e2e8f0;
         display:grid; place-items:center; min-height:100vh; margin:0; }
  .card { background:#1e293b; padding:2rem 2.5rem; border-radius:12px;
          max-width:28rem; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,.4); }
  h1 { margin:0 0 .5rem; font-size:1.4rem; }
  p { margin:.25rem 0 0; color:#94a3b8; }
</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p></div></body></html>`;

// Email-verification route. Reads the token from the query string, verifies it,
// and renders an HTML success/error page (per the brief). Errors are handled
// here rather than via the JSON error handler so both branches return HTML.
export const verify = async (req, res) => {
  try {
    const user = await authService.verifyEmail(req.query.token);
    res
      .status(200)
      .type("html")
      .send(
        page(
          "Account verified ✅",
          `Thanks, ${user.first_name}. Your account (${user.email}) is now verified — you can log in.`
        )
      );
  } catch (err) {
    res
      .status(err.status || 400)
      .type("html")
      .send(page("Verification failed ❌", err.message || "Could not verify this link."));
  }
};
