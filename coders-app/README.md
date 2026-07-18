# Project: Coders — CodeCLA Platform

A React application for the CodeCLA "Coders" platform, built up assignment by
assignment. It has all six original pages: authentication (sign-in / sign-up),
the challenges home page with a light/dark theme, the workspace (coding lab), the
leaderboard, and the profile page.

The app is now **fully wired to the [`coders-app-api`](../coders-app-api)
backend** — it authenticates with real JWTs and reads/writes live data on every
screen (challenges, submissions/grading, profile + avatar upload, leaderboard and
stats) through a single **RTK Query** slice (`src/redux/api.js`). See
[Running the app](#running-the-app-full-stack) below to start it locally.

Step-by-step walkthroughs of each stage live in
[`reference/walkthroughs/`](../reference/walkthroughs):

- [`react-walkthrough.md`](../reference/walkthroughs/react-walkthrough.md) — auth
  pages, routing, Redux, form validation.
- [`challenges-walkthrough.md`](../reference/walkthroughs/challenges-walkthrough.md)
  — the challenges home page, dummy data, and the Redux + Tailwind theme toggle.
- [`workspace-walkthrough.md`](../reference/walkthroughs/workspace-walkthrough.md)
  — the split-screen coding lab: markdown, CodeMirror, config dropdowns, and test
  cases.
- [`leaderboard-walkthrough.md`](../reference/walkthroughs/leaderboard-walkthrough.md)
  — the leaderboard table of top coders.
- [`profile-walkthrough.md`](../reference/walkthroughs/profile-walkthrough.md) —
  the profile page: avatar upload, stats bars, and the coding-strikes heatmap.
- [`coders-integration-walkthrough.md`](../reference/walkthroughs/coders-integration-walkthrough.md)
  — wiring the whole app to the backend (RTK Query, auth, and every screen), phase
  by phase.
- Earlier static-site notes: `tailwind-walkthrough.md`, `javascript-walkthrough.md`.

## What You'll Practice

- Scaffolding a React app with **Vite** and **TailwindCSS**.
- Client-side routing with **React Router** (`Link`, `Routes`, `Navigate`,
  URL params via `useParams`).
- Global state with **Redux Toolkit** (`createSlice`, `configureStore`) and data
  fetching with **RTK Query** (`createApi`, cached queries/mutations, and
  `transformResponse` to adapt backend shapes to the UI).
- Guarding pages with a **ProtectedRoute** component.
- Form validation two ways: React `useState`, and **react-hook-form + zod**.
- Composing a page from reusable **components** driven by live backend data.
- Rendering lists and tables with `.map()`, icons with **react-icons**, and
  CSS-only tooltips.
- A **light/dark theme** toggle via a Redux slice + Tailwind class dark mode,
  persisted to `localStorage`.
- Drag-resizable **split** layouts, **markdown** rendering, and an embedded
  **CodeMirror** editor.
- File uploads with `URL.createObjectURL` image preview, and a themed
  **heatmap** (`@uiw/react-heat-map`).

## Tech Stack

- React 18 + Vite
- TailwindCSS v3 (class-based dark mode)
- React Router
- Redux Toolkit + React Redux
- react-hook-form + zod
- react-icons
- react-split (resizable panes)
- @uiw/react-codemirror + @codemirror/lang-javascript / -python (code editor)
- @uiw/react-markdown-preview (markdown rendering)
- @uiw/react-heat-map (submissions heatmap)

## Running the app (full stack)

The frontend needs the backend running, because it authenticates and loads all
its data from it. Start **two terminals** — one for the API, one for this app.

### 1. Start the backend (`coders-app-api`) — terminal 1

```bash
cd html-web-pages/coders-app-api
npm install
npm run dev
```

- It connects to MongoDB Atlas and, on an empty database, **seeds demo data**
  automatically, then listens on **http://localhost:4000**.
- It reads its config from `.env.dev`. On this machine that file already exists.
  On a fresh clone, copy `.env.dev.example` → `.env.dev` and fill in the values
  (Atlas URI, `JWT_SECRET`, and — for avatar upload — the Supabase keys). See the
  backend's [README](../coders-app-api/README.md) for details.
- Leave it running.

### 2. Start the frontend (this app) — terminal 2

```bash
cd html-web-pages/coders-app
cp .env.example .env      # VITE_API_URL=http://localhost:4000 (already present on this machine)
npm install
npm run dev
```

Then open the printed URL — by default **http://localhost:5173**.

### 3. Log in and click around

Use the seeded demo coder:

- **Email:** `omar@codecla.dev`
- **Password:** `seed-not-a-real-password`

From there you can browse and filter challenges, open a challenge and **Submit**
code (the first submission can take up to a minute — the external code runner
cold-starts), edit your **profile** and upload an avatar, and view the
**leaderboard**. Registering a new account shows a "verify your email" notice with
a dev **Ethereal preview link** (registration doesn't log you in until verified).

> Ports 4000 (API) and 5173 (Vite) must be free. On this shared machine you can
> clear them with `lsof -ti tcp:4000,5173 | xargs -r kill`.

### Available scripts

- `npm run dev` — start the dev server with hot reload
- `npm run build` — build the production bundle into `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Submitting Your Assignment

- **Commit your changes:**
  ```bash
  git add -A
  git commit -m "Your commit message"
  ```
- **Push your changes:**
  ```bash
  git push origin main
  ```

## About Code Labs Academy

[Code Labs Academy](https://www.codelabsacademy.com/en) is an online coding school that offers bootcamps paired with one-on-one career coaching. Whether your goal is to change your career, acquire new skills, or launch your own start-up, our courses ranging from Cybersecurity to Data Science and AI, UI/UX Design, and Web Development will help you jump ahead!
