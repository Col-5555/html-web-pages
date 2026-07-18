# File Upload with Express — walkthrough

This assignment adds **avatar file upload** to the coder profile update in
`coders-app-api`. The uploaded image is stored in **Supabase Storage** (a public
`avatars` bucket) and its public URL is saved on the coder. The profile update is
submitted as `multipart/form-data`.

> **Scope note.** The brief's part 3 (make the React profile page submit the form)
> is deferred: `coders-app`'s `ProfileForm.jsx` is still a mock (the submit handler
> is a no-op, auth is mocked with no token, and there's no API base URL) — the same
> missing frontend↔backend integration as the previous briefs. This submission
> delivers the **backend** (parts 1–2).

---

## Supabase setup (dashboard)

1. **Create a project** at supabase.com (any region).
2. **Storage → New bucket** named **`avatars`**, with **Public bucket ON** (so the
   image URLs are viewable without authentication — we don't use Supabase Auth).
3. **Project Settings → API Keys**: copy the **project URL** and a **server-side
   key**. Use the **`service_role` / secret** key — it bypasses Storage's
   row-level security, so you avoid the RLS errors the brief warns about (no need
   to run `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY`). ⚠️ This key is
   powerful and server-only — keep it in the gitignored `.env`, never in the
   frontend.
4. Put them in `coders-app-api/.env.dev`:
   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_KEY=<service_role or sb_secret_… key>
   SUPABASE_BUCKET=avatars
   ```

---

## 1. The libraries

```bash
npm install @supabase/supabase-js multer
```

- **`multer`** — Express middleware for `multipart/form-data` (file uploads).
- **`@supabase/supabase-js`** — the Supabase client (we use its Storage API).

### Gotcha — Node 20 + Supabase needs a WebSocket polyfill

`@supabase/supabase-js` always constructs a Realtime client, which needs a global
`WebSocket`. Node only ships one natively from **v22**; on **v20** (what this
project runs) `createClient` throws *"Node.js 20 detected without native WebSocket
support"* — even though we only use Storage. Fix: install `ws` and expose it as the
global before creating the client (`src/config/supabase.js`):

```js
import ws from "ws";
if (!globalThis.WebSocket) globalThis.WebSocket = ws;
```

(Because the older `express-graphql` pins `graphql@^15`, npm needs
`--legacy-peer-deps` to add new packages — a harmless install-time flag; nothing
changes at runtime.)

## 2. In-memory upload middleware (`src/middlewares/upload.js`)

Multer with **memory storage** keeps the file in RAM (`req.file.buffer`) instead of
writing to disk — perfect, since we immediately forward it to Supabase:

```js
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },       // 5 MB cap
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(httpError(400, "Only image files are allowed for the avatar")),
});
```

## 3. The upload utility (`src/utils/avatarUpload.js`)

`uploadAvatar(file)` streams the buffer to the `avatars` bucket under a unique key
and returns the **public URL** (or `""` when there's no file, so the caller knows
the avatar is unchanged):

```js
export async function uploadAvatar(file) {
  if (!file) return "";
  const supabase = getSupabase();
  const path = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${sanitize(file.originalname)}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });
  if (error) throw httpError(502, `Avatar upload failed: ${error.message}`);
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
```

## 4. Wiring it into the existing profile route

### Before

```js
router.patch("/coders/:id/profile",
  authorize("Coder"),
  validate(updateProfileSchema),                 // JSON body, ≥1 field required
  asyncHandler(profileController.updateProfile("coder")));
```

### After

```js
router.patch("/coders/:id/profile",
  authorize("Coder"),
  uploadMiddleware.single("avatar"),             // ← parse multipart first
  validate(updateCoderProfileSchema),            // text fields, avatar-only allowed
  asyncHandler(profileController.updateProfile("coder")));
```

Two subtle points:

- **Order matters** — Multer runs *before* validation, so the text fields it parses
  out of the multipart body land on `req.body` in time for Joi to check them. The
  file itself goes on `req.file`.
- **A new validator** — the original schema required `.min(1)` field. An avatar-only
  update has an *empty* text body (the file isn't in `req.body`), so the coder
  schema drops that requirement. The manager route keeps the old JSON schema.

The middleware coexists with the app's global `express.json()` — JSON requests are
parsed by that, multipart by Multer — so the endpoint still accepts a plain JSON
update too (backward compatible).

## 5. The service (`src/services/profile.service.js`)

The controller passes `req.file` through; the service uploads it and, if a URL
comes back, updates `avatar` — alongside the existing `first_name`/`last_name` and
`about`→`description` mapping:

```js
export const updateProfile = async (role, id, updates, file) => {
  const mapped = {};
  if (updates.first_name !== undefined) mapped.first_name = updates.first_name;
  if (updates.last_name  !== undefined) mapped.last_name  = updates.last_name;
  if (role === "coder" && updates.about !== undefined) mapped.description = updates.about;

  if (role === "coder") {
    const avatarUrl = await uploadAvatar(file);   // "" when no file
    if (avatarUrl) mapped.avatar = avatarUrl;
  }
  const user = await modelFor(role).findByIdAndUpdate(id, mapped, { new: true, runValidators: true });
  if (!user) throw httpError(404, `${role} ${id} not found`);
  return user.toJSON();
};
```

## Trying it out

```bash
cd coders-app-api
# .env.dev has SUPABASE_URL / SUPABASE_KEY / SUPABASE_BUCKET
npm run dev
```

With a coder's Bearer token:

```bash
curl -X PATCH http://localhost:4000/api/coders/<coderId>/profile \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@me.png;type=image/png" \
  -F "first_name=Ada" \
  -F "about=I love recursion"
```

Response includes the new avatar URL:

```json
{ "message": "Profile updated",
  "profile": { "first_name": "Ada", "description": "I love recursion",
    "avatar": "https://<ref>.supabase.co/storage/v1/object/public/avatars/1699…-me.png" } }
```

### What was verified (live, against the real Supabase bucket)

- Multipart PATCH → **200**, `avatar` is a real
  `…/storage/v1/object/public/avatars/…` URL, and fetching that URL returns the
  image (`200 image/png`). `first_name` and `about`→`description` update too.
- **Avatar-only** update (no text fields) → 200; **JSON-only** update (no file) →
  200 (backward compatible).
- Non-image upload → **400**; someone else's profile → **403**; missing/invalid
  token → **401**.
