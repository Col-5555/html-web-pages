import * as profileService from "../services/profile.service.js";
import { httpError } from "../utils/httpError.js";

// A user may only view/update their OWN profile: the :id in the path must match
// the id injected onto req.user by the authorize() middleware.
const assertOwnership = (req) => {
  if (req.params.id !== req.user.id) {
    throw httpError(403, "You can only access your own profile");
  }
};

// GET a coder's or manager's profile by id. `role` is bound when the route is
// declared so the same handler serves both /coders/:id and /managers/:id.
export const getProfile = (role) => async (req, res) => {
  assertOwnership(req);
  const profile = await profileService.getProfile(role, req.params.id);
  res.status(200).json(profile);
};

// PATCH profile info (first_name, last_name, about). The validator middleware has
// already sanitised the text fields onto req.validated.body. For coders the
// request may be multipart/form-data carrying an `avatar` image, which Multer
// exposes on req.file — passed through to the service to upload to Supabase.
export const updateProfile = (role) => async (req, res) => {
  assertOwnership(req);
  const profile = await profileService.updateProfile(
    role,
    req.params.id,
    req.validated.body,
    req.file
  );
  res.status(200).json({ message: "Profile updated", profile });
};
