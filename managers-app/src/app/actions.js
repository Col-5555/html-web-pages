"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/challenges";

// Server Actions for mutating challenges. These run on the server and are called
// from Client Components. Create/update are added in Phase 3.

// Delete a challenge, then revalidate the dashboard so the list reloads.
export async function deleteChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`Failed to delete challenge ${id}`);
  }
  revalidatePath("/");
}
