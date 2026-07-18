import { getSupabase, AVATAR_BUCKET } from "../config/supabase.js";
import { httpError } from "./httpError.js";

// Turn a filename into something safe for a storage object key: keep the
// extension, strip anything that isn't a word char / dot / dash.
const sanitize = (name = "file") =>
  name.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").toLowerCase();

// Upload an in-memory file (a Multer file object, i.e. req.file — with `.buffer`,
// `.originalname`, `.mimetype`) to the Supabase `avatars` bucket and return its
// public URL. Returns "" when there's no file, so callers can treat an empty URL
// as "avatar unchanged".
export async function uploadAvatar(file) {
  if (!file) return "";

  const supabase = getSupabase();

  // Unique object key so re-uploads never collide.
  const path = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitize(
    file.originalname
  )}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) {
    throw httpError(502, `Avatar upload failed: ${error.message}`);
  }

  // The bucket is public, so this URL is openly accessible.
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
