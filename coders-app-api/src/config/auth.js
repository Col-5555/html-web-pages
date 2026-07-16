// Authentication configuration, read from the environment (see .env.example).
// Kept beside config/db.js so all env-derived config lives in one place.
//
// JWT_SECRET signs both the email-verification token and the login token.
// APP_URL is the public base the verification link is built from (the email a
// user clicks points back here).
export const JWT_SECRET = process.env.JWT_SECRET;
export const APP_URL = process.env.APP_URL || "http://localhost:4000";

// Token lifetimes. The verification link is short-lived; the login session lasts
// a week. Values are anything the `jsonwebtoken` `expiresIn` option accepts.
export const VERIFY_TOKEN_TTL = "1d";
export const LOGIN_TOKEN_TTL = "7d";

if (!JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set — auth tokens can't be signed/verified. Set it in .env."
  );
}
