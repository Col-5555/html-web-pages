import { verifyToken } from "../utils/token.js";
import { httpError } from "../utils/httpError.js";

// Authorization middleware *creator*. Call it with the roles allowed to reach a
// route; it returns an Express middleware that:
//   1. reads the JWT from the `Authorization: Bearer <token>` header,
//   2. verifies it (401 if missing / malformed / invalid / expired),
//   3. checks the token's role against the allowed set (403 if not allowed),
//   4. injects { id, email } from the token onto `req.user`, then calls next().
//
// Called with no roles — `authorize()` — it allows any authenticated user
// (identity is still verified and injected). The login token carries `role` so
// the role check works; only { id, email } is exposed on req.user (per the brief).
//
//   router.get("/me", authorize(), handler);                 // any logged-in user
//   router.get("/admin", authorize("Manager"), handler);     // Managers only
//
// Synchronous throws are fine: Express 5 forwards them to the error handler.
export const authorize =
  (...roles) =>
  (req, res, next) => {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw httpError(401, "Missing or malformed Authorization header");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw httpError(401, "Invalid or expired token");
    }

    if (roles.length && !roles.includes(payload.role)) {
      throw httpError(403, "Forbidden: insufficient role");
    }

    // Only identity is exposed downstream — not the role.
    req.user = { id: payload.id, email: payload.email };
    next();
  };
