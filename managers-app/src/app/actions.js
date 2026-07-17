"use server";

import { revalidatePath } from "next/cache";
import { API_URL, authHeader } from "@/lib/api/challenges";
import { toApi } from "@/lib/api/challengeMapping";

// Server Actions for mutating challenges on the NestJS backend. They run on the
// server, attach the manager's Bearer token, map the form payload to the API
// shape, and revalidate the dashboard so its list reflects the change.

// JSON headers plus the manager's Authorization token.
async function jsonAuthHeaders() {
  return { "Content-Type": "application/json", ...(await authHeader()) };
}

// Delete a challenge, then revalidate the dashboard so the list reloads.
export async function deleteChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, {
    method: "DELETE",
    headers: await authHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to delete challenge ${id}`);
  }
  revalidatePath("/");
}

// Create a challenge (NestJS assigns the id and stamps timestamps).
export async function createChallenge(data) {
  const res = await fetch(`${API_URL}/challenges`, {
    method: "POST",
    headers: await jsonAuthHeaders(),
    body: JSON.stringify(toApi(data)),
  });
  if (!res.ok) {
    throw new Error("Failed to create challenge");
  }
  revalidatePath("/");
}

// Update an existing challenge (NestJS uses PATCH, scoped to the owning manager).
export async function updateChallenge(id, data) {
  const res = await fetch(`${API_URL}/challenges/${id}`, {
    method: "PATCH",
    headers: await jsonAuthHeaders(),
    body: JSON.stringify(toApi(data)),
  });
  if (!res.ok) {
    throw new Error(`Failed to update challenge ${id}`);
  }
  revalidatePath("/");
}
