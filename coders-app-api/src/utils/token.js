import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  VERIFY_TOKEN_TTL,
  LOGIN_TOKEN_TTL,
} from "../config/auth.js";

// Thin wrappers over jsonwebtoken so the two token shapes are declared in one
// place. Both are signed with the same JWT_SECRET (see config/auth.js).

// Email-verification token — encodes the user id and role (per the brief). The
// verify route decodes this to find the user and flip is_verified.
export const signVerifyToken = ({ id, role }) =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: VERIFY_TOKEN_TTL });

// Login/session token — encodes id and email (per the brief). It ALSO carries
// role so the authorize(...roles) middleware can make role decisions; only
// { id, email } is ever injected into req.user, though.
export const signLoginToken = ({ id, email, role }) =>
  jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: LOGIN_TOKEN_TTL });

// Verify + decode any token signed above. Throws (JsonWebTokenError /
// TokenExpiredError) on a bad or expired token — callers translate that into the
// right HTTP response.
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
