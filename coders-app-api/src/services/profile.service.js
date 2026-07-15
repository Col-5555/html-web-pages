import { coderProfiles, managerProfiles } from "../data/profile.js";
import { httpError } from "../utils/httpError.js";

// Profile service — STUB. Reads from the mock profile store; the real data layer
// lands in a later assignment. `role` selects which collection to use.
const collectionFor = (role) =>
  role === "manager" ? managerProfiles : coderProfiles;

// Fetch a profile by id, or 404 if there's no such record.
export const getProfile = async (role, id) => {
  const profile = collectionFor(role)[id];
  if (!profile) {
    throw httpError(404, `${role} ${id} not found`);
  }
  return profile;
};

// Apply general-info updates and return the merged record. A real service would
// persist; here we merge onto the mock record in memory.
export const updateProfile = async (role, id, updates) => {
  const profile = await getProfile(role, id);
  const updated = { ...profile, ...updates };
  collectionFor(role)[id] = updated;
  return updated;
};
