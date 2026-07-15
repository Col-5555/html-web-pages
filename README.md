# CodeCLA — Coders & Managers

This repository holds the two front-end applications built during the CLA
bootcamp, as a small monorepo:

| App | Folder | Stack | What it is |
| --- | --- | --- | --- |
| **Coders** | [`coders-app/`](./coders-app) | Vite + React + Redux + Tailwind | The coder-facing platform: auth, challenges, workspace, leaderboard, profile. |
| **Managers** | [`managers-app/`](./managers-app) | Next.js + Redux + shadcn/ui + json-server | The admin dashboard for creating, editing, and deleting challenges. |

Each app has its own `package.json` and dependencies — `cd` into the folder you
want and run its scripts there.

```bash
# Coders app (Vite dev server)
cd coders-app && npm install && npm run dev

# Managers app (Next.js on :8080 + json-server on :3000)
cd managers-app && npm install
npm run db      # terminal 1 — json-server mock API
npm run dev     # terminal 2 — Next.js dev server
```

## Documentation

Assignment briefs and step-by-step walkthroughs live in
[`reference/`](./reference) (see [`reference/walkthroughs/`](./reference/walkthroughs)).

## Milestones

Each assignment submission is an annotated git tag — `git tag -n` lists them.
The Coders app pages: `intro-and-authentication`, `challenges-page`,
`workspace-page`, `leaderboard-page`, `profile-page`. The Managers app builds on
top from here.
