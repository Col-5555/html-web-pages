# Managers App (Next.js) — Step-by-Step Walkthrough

The Managers app is a **separate** application from the Coders app — an admin
dashboard for creating, editing, and deleting coding challenges, built with
**Next.js**, **shadcn/ui**, and a **json-server** mock backend.

It's being built in phases. This document grows with each phase.

- **Phase 1 — Auth**: monorepo restructure, project setup, json-server,
  shadcn/ui, Redux, and the signin/signup pages.
- **Phase 2 — Dashboard**: the challenges table (server-component fetch), delete
  via a server action + `revalidatePath`, and the navbar.
- **Phase 3 — Challenge form**: the two-pane create/edit form — a SimpleMDE
  markdown editor, a CodeMirror code editor driven by Redux, a dynamic tests
  builder, and create/update Server Actions.

---

## Phase 1: Setup & Authentication

### The monorepo

The repo now holds two apps side by side:

```
html-web-pages/
├── coders-app/     ← the original Vite app (moved here as a unit)
├── managers-app/   ← this Next.js app
└── reference/      ← shared: assignment PDFs + these walkthroughs
```

Each app has its own `package.json` and dependencies — you `cd` into one and run
its scripts there. Moving the Vite app didn't change any of its code: because it
moved as a whole folder, all its internal paths stayed valid.

### Creating the Next.js app

```bash
npx create-next-app@latest managers-app --js --tailwind --app --eslint --src-dir --import-alias "@/*"
```

That gives a JavaScript **App Router** project. The App Router is Next.js's
file-system router where a folder becomes a URL segment and a `page.js` file
becomes that route's UI.

Two config tweaks in `package.json` — Next and the API run on separate ports so
they don't clash (using 8457 / 3457 here, since 8080 / 3000 were taken on the dev
machine):

```jsonc
"dev":   "next dev -p 8457",     // Next on 8457…
"start": "next start -p 8457",
"db":    "json-server --watch db.json --port 3457"  // …API on 3457
```

`.env.example` records the API base the app (from Phase 2 on) uses to reach
json-server: `NEXT_PUBLIC_API_URL=http://localhost:3457`. Copy it to `.env` to
override; the code also defaults to this value if it's unset. (`.env` is
git-ignored by convention.)

### json-server (mock backend)

`json-server` turns a JSON file into a REST API with full CRUD — no backend code.
`db.json` holds the seed `challenges`, and:

```bash
npm run db      # GET/POST/PUT/DELETE http://localhost:3000/challenges
```

> Note: we pin `json-server@0.17` — the classic CLI that supports `--watch`
> (v1 removed that flag).

### shadcn/ui

shadcn/ui isn't a dependency you import from — it **copies component source into
your repo** so you own and can edit it. Initialise once, then add components:

```bash
npx shadcn@latest init          # writes components.json, lib/utils, tokens
npx shadcn@latest add button input label sonner
```

Components land in `src/components/ui/`. `sonner` is shadcn's current toast (used
for the create/edit alerts in a later phase).

### Redux in the App Router

App Router pages are **Server Components** by default, but React context (like the
Redux store) only works in **Client Components**. So the store is provided by a
small `"use client"` wrapper:

```jsx
// src/app/providers.jsx
"use client";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
```

…mounted once in the root layout, alongside the toast `<Toaster />`:

```jsx
// src/app/layout.js
<body>
  <Providers>{children}</Providers>
  <Toaster />
</body>
```

The `auth` slice (`isAuthenticated`, `user`, `login`/`logout`) is the same idea as
the Coders app.

### The signin / signup pages

`src/app/signin/page.jsx` and `src/app/signup/page.jsx` are Client Components
(`"use client"`) — they need state and event handlers. They use **shadcn** inputs
+ buttons and validate with **react-hook-form + zod** (`src/schemas/authSchemas.js`):

- Sign in: valid email, password ≥ 6.
- Sign up: first/last name ≥ 2, valid email, password ≥ 6.

Errors render under each field. On success we `dispatch(login(...))` and navigate
with the App Router's client router:

```jsx
import { useRouter } from "next/navigation";
const router = useRouter();
// …
router.push("/");
```

Navigation between the two pages uses `next/link`'s `<Link href="/signup">`.

The home page (`/`) is a guarded placeholder for now: a Client Component that
redirects to `/signin` when `isAuthenticated` is false. The real dashboard table
arrives in Phase 2.

---

## Trying it out (Phase 1)

You need **two** terminals — the API and the app:

```bash
cd managers-app
npm install
npm run db      # terminal 1 — json-server on :3457
npm run dev     # terminal 2 — Next.js on :8457
```

1. Visit `http://localhost:8457` → redirected to `/signin` (guard).
2. Submit signin with a bad email / short password → zod errors under the fields.
3. Valid submit → lands on the placeholder dashboard.
4. `/signin` ↔ `/signup` links navigate.
5. `curl http://localhost:3457/challenges` → the four seed challenges.

> If those ports are also busy on your machine, change the two numbers in
> `package.json` (`dev`/`start`/`db`) and `NEXT_PUBLIC_API_URL` in `.env`.

---

---

## Phase 2: Dashboard

This is where Next.js earns its keep — the data lives on the **server**.

### Fetching on the server

The dashboard page (`src/app/page.js`) is an **async Server Component**. It just
`await`s the data and renders — no `useEffect`, no loading state, no client fetch:

```jsx
export default async function Home() {
  const challenges = await getChallenges();   // runs on the server
  return (
    <AuthGuard>
      <Navbar />
      <main><ChallengesList challenges={challenges} /></main>
    </AuthGuard>
  );
}
```

`getChallenges` (`src/lib/api/challenges.js`) fetches from json-server with
`{ cache: "no-store" }` so the list is always fresh, and returns `[]` if the API
is down (so the page never crashes). This makes the route **dynamic** (rendered
on demand), which you can see in the build output (`ƒ /`).

### Mutating with a Server Action

Deleting is a **Server Action** — an async function marked `"use server"` that
runs on the server but is callable from the client (`src/app/actions.js`):

```js
"use server";
import { revalidatePath } from "next/cache";

export async function deleteChallenge(id) {
  const res = await fetch(`${API_URL}/challenges/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("delete failed");
  revalidatePath("/");   // tell Next the dashboard data changed → list reloads
}
```

`revalidatePath("/")` is the key: after the delete, it invalidates the dashboard
route so the server re-fetches and the table updates — no manual refetch.

### Wiring the button

The delete button is a small Client Component that calls the action inside a
transition and reports the result with a **sonner** toast:

```jsx
"use client";
const [isPending, startTransition] = useTransition();
const handleDelete = () =>
  startTransition(async () => {
    try { await deleteChallenge(id); toast.success("Challenge deleted"); }
    catch { toast.error("Failed to delete challenge"); }
  });
```

This is the recurring App Router pattern: **Server Components fetch and render;
Client Components handle interaction and call Server Actions.**

### The table + navbar

`ChallengesList` is a Server Component rendering a **shadcn `Table`** (Title,
Category, Difficulty, Created at, Actions). Each row has an Edit link
(`/challenges/[id]/edit`) and the delete button; a "New Challenge" link
(`/challenges/new`) sits above it. The `Navbar` (Challenges link + Logout) is a
Client Component because Logout dispatches Redux + navigates.

> The Edit / New links point at Phase 3 pages that don't exist yet, so they 404
> for now.

---

> The Edit / New links point at Phase 3 pages, built next.

---

## Phase 3: The challenge form

Phase 2 made the dashboard read and delete. Phase 3 adds the **create** and
**edit** screens — one two-pane form that backs both routes:

- `/challenges/new` — an empty form (create).
- `/challenges/[id]/edit` — the same form, pre-filled from the fetched challenge.

The left pane is the challenge's *details* (title, category, level, and a
markdown description); the right pane is its *starter code* (function name, a
code editor, and the tests to grade against).

### One form, two routes

The trick is a single `ChallengeForm` Client Component. Pass it a `challenge` to
edit; pass nothing to create. A small helper turns either case into
react-hook-form's default values:

```jsx
function toDefaults(challenge) {
  const code = challenge?.code ?? {};
  return {
    title: challenge?.title ?? "",
    category: challenge?.category ?? "",
    level: challenge?.level ?? "Easy",
    description: challenge?.description ?? "",
    functionName: code.functionName ?? "",
    body: code.body ?? "",
    tests: challenge?.tests ?? [],
  };
}
```

The **create** page is a plain shell around the form. The **edit** page is a
Server Component that fetches the record first — and in Next 16 the dynamic
`params` is a **Promise**, so you `await` it:

```jsx
export default async function EditChallengePage({ params }) {
  const { id } = await params;            // params is a Promise in Next 16
  const challenge = await getChallenge(id);
  // ...pass `challenge` to <ChallengeForm challenge={challenge} />
}
```

### Validating with react-hook-form + zod

Same stack as the auth forms, but bigger. The zod schema mirrors what gets
stored, including an array of tests validated per-row:

```js
export const challengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  level: z.enum(["Easy", "Moderate", "Hard"]),
  description: z.string().min(1, "Description is required"),
  functionName: z.string().min(1, "Function name is required"),
  body: z.string(),
  tests: z.array(testSchema),
});
```

Plain text inputs use `register("title")`. The custom widgets — the level
`Select`, the markdown editor, the code editor — aren't native inputs, so they're
wired through react-hook-form's **`Controller`**, which hands each a
`value`/`onChange` pair:

```jsx
<Controller
  control={control}
  name="description"
  render={({ field }) => (
    <MarkdownField value={field.value} onChange={field.onChange} />
  )}
/>
```

### The markdown editor (client-only)

The description uses **SimpleMDE** via `react-simplemde-editor`. SimpleMDE
touches the DOM as it loads, so it can't be server-rendered — `next/dynamic` with
**`ssr: false`** loads it on the client only (that option is only allowed inside
a Client Component):

```jsx
"use client";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => <div>Loading editor…</div>,
});
```

One gotcha: memoise the `options` object (`useMemo`), or SimpleMDE re-initialises
on every keystroke and the cursor jumps.

### The code editor + Redux

The right pane reuses the **Coders app's** approach: a **CodeMirror** editor
(`@uiw/react-codemirror`) whose language and font size live in a Redux
`workspace` slice. Two shadcn **dropdown menus** (`LanguageMenu`, `FontSizeMenu`)
dispatch to that slice; the editor reads it:

```jsx
const { language, fontSize } = useSelector((s) => s.workspace);
const languageExtension = language === "python" ? python() : javascript();
const fontSizeExtension = EditorView.theme({ "&": { fontSize: `${fontSize}px` } });
```

The chosen `language` is also saved onto the challenge's `code`, so an edited
challenge re-opens in the right language — a `useEffect` seeds the slice from the
record when the edit form mounts.

### The dynamic tests builder

Each challenge grades submissions against a list of tests, and the manager can
add or remove rows. react-hook-form's **`useFieldArray`** handles that:

```jsx
const { fields, append, remove } = useFieldArray({ control, name: "tests" });
// append(EMPTY_TEST) on "Add test"; remove(index) on the row's trash button
```

Each row is `{ type, name, value, output, weight }` — `type` is a `string`/
`number` `Select`, `weight` a 0–1 float. Because the rows are part of the same
form, they validate together with everything else on submit.

### Saving: two more Server Actions

`src/app/actions.js` gains `createChallenge` and `updateChallenge` alongside the
Phase 2 `deleteChallenge`. Create stamps `createdAt` and **POST**s; update
**PUT**s; both `revalidatePath("/")` so the dashboard reflects the change:

```js
"use server";
export async function createChallenge(data) {
  const createdAt = new Date().toISOString().slice(0, 10);
  const res = await fetch(`${API_URL}/challenges`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, createdAt }),
  });
  if (!res.ok) throw new Error("Failed to create challenge");
  revalidatePath("/");
}
```

The form calls the right action inside a `useTransition`, shows a **sonner**
toast, and routes back to the dashboard:

```jsx
startTransition(async () => {
  try {
    isEdit ? await updateChallenge(challenge.id, payload)
           : await createChallenge(payload);
    toast.success(isEdit ? "Challenge updated" : "Challenge created");
    router.push("/");
  } catch {
    toast.error("Failed to save challenge");
  }
});
```

Same division of labour as before: **the client validates and collects; the
Server Action mutates and revalidates.**

## Trying it out (Phase 3)

With both servers running (`npm run db` + `npm run dev`) and signed in:

1. Dashboard → **New Challenge** → the two-pane form at `/challenges/new`.
2. Submit empty → zod errors under the required fields.
3. Fill the left pane (title/category/level + markdown), the right pane (function
   name + code), switch the editor **language** and **font size** (dropdowns),
   and **Add test** a row or two.
4. **Create challenge** → success toast → back on the dashboard with the new row.
5. Click a row's **edit** (pencil) → the form re-opens pre-filled, editor in the
   saved language → change something → **Save changes** → toast → updated row.
6. `curl http://localhost:3457/challenges` → your new/edited record is persisted
   (json-server writes back to `db.json`).

> No browser driver ships with this environment, so the interactive flow above is
> verified by `npm run build` / `npm run lint`, the routes serving 200, and the
> json-server POST/PUT contract — not by clicking. Give it a click-through
> yourself to confirm the UI.

---

## Phase 4: Real-backend integration

The dashboard was built against **json-server** with mock auth. This phase swaps both
for the real services: **auth** goes to the Express `coders-app-api` (:4000), and
**challenges** to the NestJS `managers-app-api` (:4100). The pages and components barely
change — the work is in the data layer and a pair of Next.js route handlers.

### Auth through a Backend-for-Frontend

Rather than call Express from the browser, the forms post to this app's own **route
handlers** (`src/app/api/auth/{signup,signin}/route.js`), which use **Axios** to talk to
Express server-side. That keeps the backend URL and the token off the client, and gives a
clean seam for setting cookies.

```js
// src/app/api/auth/signin/route.js
export async function POST(request) {
  const { email, password } = await request.json();
  try {
    const { data } = await axios.post(`${EXPRESS_API_URL}/api/auth/managers/login`, { email, password });
    (await cookies()).set("token", data.token, { path: "/", sameSite: "lax", maxAge: 7 * 24 * 3600 });
    return Response.json({ token: data.token, user: data.user });
  } catch (error) {
    // relay Express's status + message: 401 bad creds, 403 unverified, …
    return Response.json({ message: error.response?.data?.message ?? "…" }, { status: error.response?.status ?? 502 });
  }
}
```

Two Next-16 details matter here: route handlers are `export async function POST(request)`
in an `app/api/**/route.js` file, and **`cookies()` is async** — `await cookies()` before
`.set`/`.get`. (Setting a cookie is only allowed in a route handler or server action, not
during a Server Component render.)

### Token in two places, on purpose

The token is stored **both** in Redux (for the client) and in a **cookie** (for the
server): the cookie is set by the signin route handler and is *readable* (no `httpOnly`)
so `providers.jsx` can rehydrate Redux from it on a hard refresh, while the challenge data
layer / server actions read the same cookie via `cookies()` to authorize their API calls.

```js
// providers.jsx — rehydrate once on the client, before render
if (typeof window !== "undefined" && !store.getState().auth.isAuthenticated) {
  const token = readCookie("token");
  const payload = token && decodeJwt(token);         // {id, email, role}
  if (payload) store.dispatch(login({ token, user: { ...payload } }));
}
```

`AuthGuard` gained a `mounted` gate so the server render and the first client render agree
(both render nothing) — avoiding a hydration mismatch — before it redirects an
unauthenticated manager to `/signin`.

### The verification reality

Express registers managers as **unverified** and refuses login until the emailed link is
clicked. So the flow is honest about it: **signup → redirect to `/signin`** with a "check
your email to verify" toast; a premature login shows Express's `403 Please verify your
email…`. In dev the link is an Ethereal preview printed to the Express log.

### Trying it out (Phase 4 — auth)

```bash
# Express on :4000, managers-app on :8457.
curl -s -X POST localhost:8457/api/auth/signup -H 'Content-Type: application/json' \
  -d '{"firstName":"A","lastName":"B","email":"m@example.com","password":"secret123"}'   # 201
# → click the verify link from the Express log, then:
curl -si -X POST localhost:8457/api/auth/signin -H 'Content-Type: application/json' \
  -d '{"email":"m@example.com","password":"secret123"}'   # 200 { token, user } + Set-Cookie: token=…
# Before verifying → 403; wrong password → 401; duplicate signup → 409 — all relayed from Express.
```

### Challenges through the NestJS API

The challenge data layer swaps json-server for the NestJS backend, and the token rides
along on every call. `getChallenges`/`getChallenge` read the token cookie and send it as a
Bearer header (server-side, via `cookies()`), and the server actions do the same for
create/update/delete:

```js
// src/lib/api/challenges.js
export async function authHeader() {
  const token = (await cookies()).get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export async function getChallenges() {
  const res = await fetch(`${API_URL}/challenges`, { cache: "no-store", headers: await authHeader() });
  return res.ok ? (await res.json()).map(fromApi) : [];   // 401/down → empty list, no crash
}
```

Create/update send `toApi(data)`; delete just needs the header. Note the method change:
NestJS updates with **PATCH** (scoped to the owning manager), where json-server used PUT.

### The shape mapper is the real work

The form and the API disagree on names, nesting, and types, so a single module
(`src/lib/api/challengeMapping.js`) translates both directions — which lets the pages,
the table, and the two-pane form stay **completely unchanged**:

| form / list | NestJS API |
| --- | --- |
| `id`, `level`, `createdAt` (YYYY-MM-DD) | `_id`, `difficulty`, `createdAt` (ISO) |
| `code.functionName` / `language` (`javascript`) / `body` | `code.function_name` / `code_text[].language` (`js`) / `content`\|`text` |
| `tests[{ type, name, value, output, weight }]` (strings) | `tests[{ weight, inputs:[{name,value}], expected_output }]` (JSON) |

`toApi` also **coerces** each test's value/output to a number when its `type` is
`"number"`, derives the function's `code.inputs` from the test names, and maps the editor
language (`javascript`→`js`); `fromApi` reverses all of it (inferring `type` from
`typeof value`, formatting the date, `js`→`javascript`). Because value/output are stored
as real JSON but edited as text, `fromApi` stringifies them back for the inputs.

### Trying it out (Phase 4 — challenges)

```bash
# Express :4000, NestJS :4100, managers-app :8457, signed in as a verified manager.
# The dashboard (GET /) lists that manager's challenges from NestJS; New/Edit/Delete
# go through the server actions to NestJS with the Bearer token.
```

> Honesty note: no browser driver here, so the create→list→edit→delete flow was verified
> by (a) `npm run build`, (b) a `toApi`/`fromApi` round-trip unit check, and (c) driving
> the **real** NestJS API with a real manager token through the mapper — CREATE 201, the
> list/edit shapes matching what the table and form read, PATCH updating the difficulty,
> the `javascript`↔`python` language round-tripping, and DELETE then 404. The final UI
> click-through is left for you to confirm in a browser.
