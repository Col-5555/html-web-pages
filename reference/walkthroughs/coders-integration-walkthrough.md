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
- **Phase 2 — Challenges list** (planned).
- **Phase 3 — Workspace / submissions** (planned).
- **Phase 4 — Profile + avatar upload + stats** (planned).
- **Phase 5 — Leaderboard + Home sidebar** (planned).

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
