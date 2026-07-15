# Managers App (Next.js) — Step-by-Step Walkthrough

The Managers app is a **separate** application from the Coders app — an admin
dashboard for creating, editing, and deleting coding challenges, built with
**Next.js**, **shadcn/ui**, and a **json-server** mock backend.

It's being built in phases. This document grows with each phase.

- **Phase 1 — Auth** (this section): monorepo restructure, project setup,
  json-server, shadcn/ui, Redux, and the signin/signup pages.
- Phase 2 — Dashboard (challenges table + delete) — *coming next*.
- Phase 3 — Challenge form (create/edit) — *coming next*.

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

## What's next

Phase 2 builds the dashboard: a navbar, a shadcn table of challenges loaded via a
**server action** from json-server, and per-row Edit/Delete (delete via a server
action + `revalidatePath`).
