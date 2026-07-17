// Data access for the `challenges` resource on the NestJS backend
// (managers-app-api). Runs on the server; the manager's JWT is read from the
// token cookie and passed as a Bearer header, and responses are mapped from the
// API shape to the shape the pages/components expect.
import { cookies } from "next/headers";
import { fromApi } from "./challengeMapping";

export const API_URL = process.env.NESTJS_API_URL || "http://localhost:4100";

// The Authorization header carrying the manager's token (empty if not signed in,
// in which case the NestJS guard replies 401 and we degrade to an empty list).
export async function authHeader() {
  const token = (await cookies()).get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Fetch the signed-in manager's challenges. `no-store` keeps the list fresh; any
// failure (backend down, not signed in) yields an empty list rather than a crash.
export async function getChallenges() {
  try {
    const res = await fetch(`${API_URL}/challenges`, {
      cache: "no-store",
      headers: await authHeader(),
    });
    if (!res.ok) return [];
    const docs = await res.json();
    return docs.map(fromApi);
  } catch {
    return [];
  }
}

// Fetch a single challenge by id (used by the edit page), mapped to form shape.
export async function getChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, {
    cache: "no-store",
    headers: await authHeader(),
  });
  if (!res.ok) return null;
  return fromApi(await res.json());
}
