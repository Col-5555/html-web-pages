// Data access for the `challenges` resource on the json-server mock API.
// The base URL comes from NEXT_PUBLIC_API_URL, defaulting to the `db` script's
// port so the app works without a .env file.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3457";

// Fetch all challenges. Runs on the server (called from the dashboard Server
// Component). `no-store` keeps it uncached so the list is always fresh; if the
// mock API isn't running we return an empty list rather than crashing the page.
export async function getChallenges() {
  try {
    const res = await fetch(`${API_URL}/challenges`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Fetch a single challenge by id (used by the edit page in Phase 3).
export async function getChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
