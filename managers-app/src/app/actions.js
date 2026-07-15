"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/challenges";

// Server Actions for mutating challenges. These run on the server and are called
// from Client Components; each revalidates the dashboard so its list reflects
// the change on the next visit.

// Delete a challenge, then revalidate the dashboard so the list reloads.
export async function deleteChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete challenge ${id}`);
  }
  revalidatePath("/");
}

// Create a challenge. The form sends the edited fields; the server stamps
// `createdAt` (json-server assigns the id) and POSTs it.
export async function createChallenge(data) {
  const createdAt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const res = await fetch(`${API_URL}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, createdAt }),
  });
  if (!res.ok) {
    throw new Error("Failed to create challenge");
  }
  revalidatePath("/");
}

// Update an existing challenge (PUT replaces the record). The form passes the
// original `createdAt` through so it survives the edit.
export async function updateChallenge(id, data) {
  const res = await fetch(`${API_URL}/challenges/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, id }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update challenge ${id}`);
  }
  revalidatePath("/");
}
