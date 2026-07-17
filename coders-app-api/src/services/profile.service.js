import { User, Coder, Manager } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

// Update/read through the matching discriminator model so subtype-only paths
// (e.g. a Coder's `description`) are recognised — the base User schema doesn't
// declare them, and strict mode would otherwise drop them on update.
const modelFor = (role) => (role === "manager" ? Manager : Coder);

// Profile service — real persistence over the Mongoose User model. `role` is the
// expected user type ("coder" | "manager"); ownership (a user may only touch
// their own profile) is enforced upstream in the controller.

// Fetch a profile by id (404 if missing). For a coder, also compute their
// leaderboard **rank** = 1 + the number of coders with a strictly higher score.
export const getProfile = async (role, id) => {
  const user = await User.findById(id);
  if (!user) throw httpError(404, `${role} ${id} not found`);

  if (role === "coder") {
    const rank = 1 + (await Coder.countDocuments({ score: { $gt: user.score } }));
    return { ...user.toJSON(), rank };
  }
  return user.toJSON();
};

// Apply general-info updates and return the merged record. The update validator
// uses `about`; for coders that maps onto the model's `description` (bio) field.
// Managers have no bio, so `about` is ignored for them. Avatar is a later brief.
export const updateProfile = async (role, id, updates) => {
  const mapped = {};
  if (updates.first_name !== undefined) mapped.first_name = updates.first_name;
  if (updates.last_name !== undefined) mapped.last_name = updates.last_name;
  if (role === "coder" && updates.about !== undefined) mapped.description = updates.about;

  const user = await modelFor(role).findByIdAndUpdate(id, mapped, {
    new: true,
    runValidators: true,
  });
  if (!user) throw httpError(404, `${role} ${id} not found`);
  return user.toJSON();
};
