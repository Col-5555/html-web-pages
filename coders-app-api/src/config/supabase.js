import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// supabase-js always spins up a Realtime client, which needs a global WebSocket.
// Node only exposes one natively from v22; on v20 (what this project runs) the
// client throws "Node.js 20 detected without native WebSocket support" the moment
// it's created. We never use Realtime (only Storage), but the polyfill silences
// that — provide `ws` as the global WebSocket if the runtime lacks one.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = ws;
}

// Supabase client used for file storage (the `avatars` bucket). Credentials come
// from the environment (see .env.example): SUPABASE_URL + SUPABASE_KEY. Use a
// server-side key (service_role, or a "secret" key) — it lives only in the
// backend's gitignored env and must never reach the frontend.
//
// The client is created lazily and cached, so the API still boots when the
// Supabase env vars are absent (mirrors how config/db.js guards MongoDB); the
// error only surfaces if an upload is actually attempted.

// Bucket the avatars are stored in (public, so the image URLs are openly viewable).
export const AVATAR_BUCKET = process.env.SUPABASE_BUCKET || "avatars";

let client = null;

export function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured — set SUPABASE_URL and SUPABASE_KEY in your .env"
    );
  }

  client = createClient(url, key);
  return client;
}
