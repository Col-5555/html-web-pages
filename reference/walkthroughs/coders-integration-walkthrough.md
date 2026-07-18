# Coders App Integration (React → coders-app-api) — Step-by-Step Walkthrough

Until now the **Coders app** (Vite/React) was 100% mock: static `src/data/*.js`,
a fake auth module (`src/api/auth.js`) that resolved after a `setTimeout` with no
token, no API base URL, and no session persistence. The **coders-app-api**
backend (Express, MongoDB Atlas, :4000) was already complete. This assignment
wires the two together so the app really authenticates and reads/writes live
data.

It's being built in **five phases**, one commit + tag each, with a review
checkpoint between. This document grows with each phase.

- **Phase 1 — Foundation + Auth**: backend CORS, the RTK Query API slice, store +
  localStorage persistence, a real token in Redux, and live sign-in / sign-up.
- **Phase 2 — Challenges list**: the Home table + category filter now read live
  data via RTK Query, with the backend↔UI field mapping done in
  `transformResponse`.
- **Phase 3 — Workspace / submissions**: the coding lab loads a real challenge,
  the editor code lives in Redux, and Submit posts to the grader (external code
  runner) and shows the per-test result.
- **Phase 4 — Profile + avatar upload + stats**: the profile form loads/saves the
  coder's real profile (avatar upload included), and the stats panels read live
  solved-challenge counts + the submission heatmap.
- **Phase 5 — Leaderboard + Home sidebar**: the leaderboard table and the Home
  sidebar (top coders + trending categories) read live data — the app is now
  fully backend-integrated.

Design decisions (agreed up front): **all REST** via a single RTK Query slice
(the backend's `/graphql` read layer stays unused by this frontend), and the UI
components stay untouched — every field-name mismatch between the backend and the
existing mock shapes is reconciled in RTK Query `transformResponse`, not in JSX.

---

## Phase 1: Foundation & Authentication

### Backend — CORS

The browser app runs on `http://localhost:5173` and calls the API on `:4000` — a
different origin — so the API must send CORS headers or the browser blocks every
request. The API had none, so we add the `cors` package and enable it before the
JSON body parser:

```js
// coders-app-api/src/app.js
import cors from "cors";
// ...
app.use(cors());        // dev-open, mirroring the Nest app's enableCors()
app.use(express.json());
```

(Installed with `npm install cors --legacy-peer-deps` — the repo needs
`--legacy-peer-deps` because `express-graphql` pins `graphql@16` as a peer.)

### Frontend — one API base URL

Vite exposes any `VITE_`-prefixed env var to the client as
`import.meta.env.VITE_API_URL`. A new `.env` (and committed `.env.example`) holds:

```
VITE_API_URL=http://localhost:4000
```

### The RTK Query API slice (`src/redux/api.js`)

This is the shared foundation every later phase builds on. One `createApi` slice,
one cache, one place that attaches the token:

```js
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});
```

`rawBaseQuery` is wrapped so that any **401** dispatches `logout()` — an expired
token boots the user back to sign-in everywhere at once. Later phases add their
endpoints with `api.injectEndpoints`; Phase 1 defines `login` and `register`
mutations (`useLoginMutation`, `useRegisterMutation`).

### Store wiring + session persistence

`store.js` registers the API reducer + middleware and `setupListeners`. It also
**persists the `auth` slice to `localStorage`**: a `loadAuth()` helper seeds
`preloadedState` on start-up, and a `store.subscribe` writes `state.auth` back on
every change — so a signed-in session survives a page refresh (before this, a
refresh wiped the login).

### A real token in Redux

`authSlice` gains a `token` field. `login` now takes `{ user, token }` (the exact
shape the backend's login response returns); `logout` clears user + token. The
JWT — not the old `isAuthenticated` boolean — becomes the source of truth, so
`ProtectedRoute` guards on `state.auth.token`.

### Sign-in / Sign-up against the backend

- **`SignIn.jsx`** calls `useLoginMutation`, sends `{ email, password }` (the
  password was collected but ignored before), stores the returned `{ user, token }`,
  and lands on Home. Auth errors are surfaced from the API: **401** wrong
  credentials, **403** unverified email.
- **`SignUp.jsx`** calls `useRegisterMutation` (mapping the form's
  `firstName`/`lastName` to the backend's snake_case `first_name`/`last_name`).
  Registration does **not** log you in — the account is created unverified — so on
  success it shows a "check your email to verify" notice plus the dev **Ethereal
  preview link** (`emailPreviewUrl`) and points to sign-in.
- **`Navbar.jsx`** reads the backend's snake_case `first_name`/`last_name` and the
  real `avatar` URL (falling back to a placeholder when empty).

The mock `src/api/auth.js` is deleted.

### Backend contract (verified)

| Request | Result |
| --- | --- |
| `POST /api/auth/coders/login` (good creds) | `200 { token, user }` |
| …wrong password | `401 Invalid email or password` |
| …unverified account | `403 Please verify your email…` |
| `POST /api/auth/coders/register` | `201 { message, user, emailPreviewUrl }` (no token) |

The serialized `user` is snake_case (`_id`, `first_name`, `last_name`, `email`,
`avatar`, `role`, `is_verified`) with the password hash stripped by the model's
`toJSON` transform.

---

## Phase 2: Challenges list + categories (Home)

The Home screen's challenges table and its category filter were driven entirely
by `src/data/challenges.js` / `src/data/categories.js`. They now read live data.

### Two query endpoints

Added to the RTK Query slice (`src/redux/api.js`):

```js
getChallenges: builder.query({
  query: (category) =>
    category ? `/challenges?category=${encodeURIComponent(category)}` : "/challenges",
  transformResponse: (challenges) => challenges.map(mapChallengeSummary),
  providesTags: ["Challenge"],
}),
getCategories: builder.query({
  query: () => "/categories",     // plain array of strings — no mapping needed
  providesTags: ["Challenge"],
}),
```

### The field mapping lives in `transformResponse`

The backend and the existing table disagree on a few names, so the components
stay untouched — the mapping happens once, in `mapChallengeSummary`:

| Backend | UI |
| --- | --- |
| `_id` | `id` |
| `solution_rate` (int, e.g. `50`) | `solutionRate` (`"50%"`) |
| `status: "Waiting"` | `status: "Pending"` (the UI's value; `Attempted` / `Completed` already match) |

`StatusIcon` already renders `Pending` (amber hourglass), so no icon changes were
needed.

### Home wiring

`Home.jsx` swaps the mock imports for `useGetChallengesQuery` /
`useGetCategoriesQuery`. Filtering is done **server-side**: the selected category
is passed to the query (`"All"` sends `undefined`, omitting the param). The page
shows loading / error states, and `CategoriesList` now takes the fetched
categories as a prop instead of importing the mock file (which is deleted).

### Verified against the live backend

`GET /api/categories` → `["Data structure","Graphs","Math"]`; `GET /api/challenges`
returns the four seeded challenges (`solution_rate` ints + `Waiting`/`Completed`
statuses, mapped to `"NN%"` + `Pending`/`Completed`); `?category=Graphs` filters
to one; a request with no token → `401`. `npm run build` + `lint` clean.

---

## Phase 3: Workspace — challenge detail + code submission

The coding lab (`/workspace/:challengeId`) was reading the mock
`src/data/challenges.js` and its Submit button was a no-op. It now loads the real
challenge and grades real submissions.

### One endpoint for the detail, one for grading

```js
getChallenge: builder.query({
  query: (id) => `/challenges/${id}`,
  transformResponse: mapChallengeDetail,
  providesTags: (r, e, id) => [{ type: "Challenge", id }],
}),
submit: builder.mutation({
  query: (body) => ({ url: "/submissions", method: "POST", body }),
  invalidatesTags: ["Challenge"],   // a pass changes status -> refresh list + detail
}),
```

`mapChallengeDetail` adds the workspace-only shaping on top of the summary
mapping:

| Backend | UI |
| --- | --- |
| `code.code_text` `[{ language:"js"\|"py", content }]` | `starterCode` `{ js, py }` |
| `tests` `[{ inputs:[{name,value}], expected_output }]` | `[{ id, inputText, outputText }]` (`inputText` = the values joined, `outputText` = the expected output as JSON) |
| `code.function_name` | `functionName` |

### Editor code lifted into Redux

Previously the CodeMirror value was `CodeEditor`'s local `useState`, invisible to
the Submit button. The `workspace` slice now owns `code` (and `result`), with
`setCode` / `setResult`. `CodeEditor` reads/writes `state.workspace.code`, and a
small effect **seeds it from the challenge's starter code for the current
language** (re-seeding when the challenge or language changes — the editor's
`"javascript"`/`"python"` map to the backend's `"js"`/`"py"`).

### Submit → grade

`TestCases` reads the lifted `code` + `language` from Redux and posts
`{ lang, code, challenge_id }` via `useSubmitMutation`. Because the grader calls
an **external code runner on a free tier that can cold-start**, it shows a
"can take up to a minute" loading note, then renders the result: a Passed/Failed
banner with the score, and a per-test list. Error responses are surfaced too
(e.g. `409` "already solved", `502/504` runner unavailable/timeout). The panel
resets when navigating to a different challenge.

### Verified against the live backend (real grader)

`GET /api/challenges/:id` returns the mapped detail; a correct `fib` submission →
`{ passed:true, score:100, status:"passed", test_results:[{status:"passed",
test_id,…}] }`; a wrong answer → `{ passed:false, score:0, status:"failed" }`;
re-submitting a solved challenge → `409`. (The test submissions were removed
afterward to leave the demo data untouched.) `npm run build` + `lint` clean.

With this phase the app no longer imports any `src/data/*.js` challenge mock —
`challenges.js` is deleted.

---

## Phase 4: Profile — view/update + avatar upload + stats

The profile page's form (`ProfileForm`) and its two stat panels
(`CompletedChallenges`, `CodingStrikes`) were driven by `src/data/profile.js` and
the Update button was a no-op. They now read and write live data.

### Four endpoints

```js
getProfile: builder.query({                 // owner-only; returns user + rank
  query: (id) => `/coders/${id}/profile`,
  providesTags: (r, e, id) => [{ type: "Profile", id }],
}),
updateProfile: builder.mutation({           // multipart: avatar file + text fields
  query: ({ id, formData }) => ({ url: `/coders/${id}/profile`, method: "PATCH", body: formData }),
  invalidatesTags: (r, e, { id }) => [{ type: "Profile", id }],
}),
getSolvedChallenges: builder.query({ query: () => "/stats/solved-challenges", transformResponse: … }),
getHeatmap: builder.query({ query: () => "/stats/heatmap" }),   // already [{date,count}]
```

### The form

`ProfileForm` fetches the logged-in coder's profile (`user._id`) and seeds its
fields from the backend's snake_case shape (`first_name`, `last_name`,
`description` → bio, `avatar`, `rank`). Submit builds a **`FormData`** with the
text fields plus the picked avatar `File` and PATCHes it — RTK Query's
`fetchBaseQuery` sends it as `multipart/form-data` (no manual content-type), so
the image reaches Multer → Supabase. On success the returned profile is written
back to the auth slice via a new `setUser` action, so the **Navbar name/avatar
update immediately**. This completes the file-upload brief's frontend half.

### The stat panels

- `CompletedChallenges` reads `getSolvedChallenges`, whose `transformResponse`
  reshapes the backend's flat `totalEasySolvedChallenges` / `totalEasyChallenges`
  / … into the panel's `{ easy|moderate|hard: { solved, total } }` (the bars still
  compute the percentage themselves).
- `CodingStrikes` reads `getHeatmap` — the backend already returns
  `[{ date:"YYYY/MM/DD", count }]`, exactly what `@uiw/react-heat-map` wants. The
  static `panelColors` + `heatmapStartDate` helpers stay in `data/profile.js`
  (now trimmed to just those two); its mock `profile` / `completedChallenges` /
  `heatmapValue` are gone.

### Verified against the live backend

`GET /coders/:id/profile` returns the profile + `rank`; `GET
/stats/solved-challenges` and `GET /stats/heatmap` return the expected shapes; a
`multipart` `PATCH` with text fields + an image → `200 { message, profile }` with
the updated fields and a fresh Supabase avatar URL. (omar's profile was restored
afterward.) `npm run build` + `lint` clean.

---

## Phase 5: Leaderboard + Home sidebar

The last three mock files powered the leaderboard page and the Home sidebar. With
this phase they read live data and the app is fully backend-integrated.

### Three endpoints

```js
getLeaderboard: builder.query({          // coders by score; rank = row order
  query: () => "/leaderboard",
  transformResponse: (coders) => coders.map((c, i) => ({ id: c._id, rank: i + 1, … })),
  providesTags: ["Leaderboard"],
}),
getTopCoders: builder.query({            // Home sidebar cards; _id->id, avatar->avatar_url
  query: (k = 4) => `/leaderboard/top?k=${k}`,
  transformResponse: (coders) => coders.map((c) => ({ id: c._id, avatar_url: c.avatar, … })),
  providesTags: ["Leaderboard"],
}),
getTrendingCategories: builder.query({   // already [{ category, count }]
  query: () => "/stats/trending-categories",
  providesTags: ["Stats"],
}),
```

The backend orders coders by score but doesn't send a `rank`, so the leaderboard
map derives it from the row index; the top-coder cards map `_id`→`id` and
`avatar`→`avatar_url` (an empty avatar falls back to initials in `CoderCard`).
`Leaderboard` gets loading/error states; `TopKCodersList` asks for `k = 4`.

### Cache invalidation across phases

Now that scores and stats are live, the **`submit`** mutation invalidates
`Challenge`, `Leaderboard`, **and** `Stats` — so solving a challenge refreshes the
challenge status, the leaderboard, and the solved/heatmap/trending panels
together.

### Verified against the live backend

`GET /leaderboard` returns the coders ordered by score (password projected out,
`solved_challenges` included); `GET /leaderboard/top?k=4` returns the same ordered
subset; `GET /stats/trending-categories` returns `[{ category, count }]`. `npm run
build` + `lint` clean.

---

## Done

All five phases are complete: the Coders app authenticates and reads/writes live
data across every screen. No `src/data/*.js` mock remains except the heatmap's
static `panelColors` / `heatmapStartDate` helpers. The whole app talks to
`coders-app-api` through **one RTK Query slice** (`src/redux/api.js`), with every
backend↔UI shape difference reconciled in `transformResponse` so the components
kept their original shapes.
