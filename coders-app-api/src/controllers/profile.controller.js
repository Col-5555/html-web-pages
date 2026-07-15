import * as profileService from "../services/profile.service.js";

// GET a coder's or manager's profile by id. `role` is bound when the route is
// declared so the same handler serves both /coders/:id and /managers/:id.
export const getProfile = (role) => async (req, res) => {
  const profile = await profileService.getProfile(role, req.params.id);
  res.status(200).json(profile);
};

// PATCH general profile info (first_name, last_name, about). The update
// validator middleware has already sanitised the body onto req.validated.body.
export const updateProfile = (role) => async (req, res) => {
  const profile = await profileService.updateProfile(
    role,
    req.params.id,
    req.validated.body
  );
  res.status(200).json({ message: "Profile updated", profile });
};
