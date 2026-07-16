// Auth service — real registration/login/verification against the Mongoose
// User model (Coder/Manager discriminators). Passwords are hashed by the model's
// pre-save hook; tokens are signed here.

import { User, Coder, Manager } from "../models/index.js";
import { httpError } from "../utils/httpError.js";
import { signVerifyToken, signLoginToken, verifyToken } from "../utils/token.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import { APP_URL } from "../config/auth.js";

// The register/login routes are bound per user type; map that to the right
// discriminator model.
const modelForRole = (role) => (role === "manager" ? Manager : Coder);

// Register a new account (Coder or Manager). Rejects duplicate emails, creates
// the user as unverified with a hashed password, and emails a verification link
// carrying a JWT { id, role }.
export const register = async ({ role, first_name, last_name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw httpError(409, "An account with this email already exists");
  }

  const Model = modelForRole(role);
  let user;
  try {
    user = await Model.create({ first_name, last_name, email, password });
  } catch (err) {
    // Backstop for the unique index in case of a race between the check above
    // and the insert.
    if (err.code === 11000) {
      throw httpError(409, "An account with this email already exists");
    }
    throw err;
  }

  // Verification token encodes id + role (the discriminator value, e.g. "Coder").
  const token = signVerifyToken({ id: user.id, role: user.role });
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;
  const emailPreviewUrl = await sendVerificationEmail(user, verifyUrl);

  return { user, emailPreviewUrl };
};

// Log in a Coder or Manager. Returns proper errors for wrong credentials and
// unverified accounts; on success issues a JWT { id, email, role }.
export const login = async ({ role, email, password }) => {
  const user = await User.findOne({ email });

  // Use the same 401 for "no such user", wrong password, and role mismatch so we
  // don't leak which emails exist or which type they are.
  const invalid = () => httpError(401, "Invalid email or password");

  if (!user || user.role.toLowerCase() !== role) throw invalid();

  const passwordOk = await user.comparePassword(password);
  if (!passwordOk) throw invalid();

  if (!user.is_verified) {
    throw httpError(403, "Please verify your email address before logging in");
  }

  const token = signLoginToken({ id: user.id, email: user.email, role: user.role });
  return { token, user };
};

// Verify an email token: decode it, find the user by the encoded id, and mark
// them verified. Idempotent — re-verifying an already-verified account succeeds.
// Throws on an invalid/expired token or an unknown user.
export const verifyEmail = async (token) => {
  if (!token) throw httpError(400, "Missing verification token");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw httpError(400, "Invalid or expired verification token");
  }

  const user = await User.findById(payload.id);
  if (!user) throw httpError(404, "Account not found");

  if (!user.is_verified) {
    user.is_verified = true;
    await user.save();
  }

  return user;
};
