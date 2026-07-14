# Project: Coders — CodeCLA Platform

A React application for the CodeCLA "Coders" platform, built up assignment by
assignment. So far it has authentication (sign-in / sign-up) and the challenges
home page, with a light/dark theme.

Step-by-step walkthroughs of each stage:

- [`react-walkthrough.md`](./react-walkthrough.md) — auth pages, routing, Redux,
  form validation.
- [`challenges-walkthrough.md`](./challenges-walkthrough.md) — the challenges home
  page, dummy data, and the Redux + Tailwind theme toggle.

## What You'll Practice

- Scaffolding a React app with **Vite** and **TailwindCSS**.
- Client-side routing with **React Router** (`Link`, `Routes`, `Navigate`).
- Global state with **Redux Toolkit** (`createSlice`, `configureStore`).
- Guarding pages with a **ProtectedRoute** component.
- Form validation two ways: React `useState`, and **react-hook-form + zod**.
- Composing a page from reusable **components** driven by dummy data.
- Rendering lists with `.map()`, icons with **react-icons**, and CSS-only
  tooltips.
- A **light/dark theme** toggle via a Redux slice + Tailwind class dark mode,
  persisted to `localStorage`.

## Tech Stack

- React 18 + Vite
- TailwindCSS v3 (class-based dark mode)
- React Router
- Redux Toolkit + React Redux
- react-hook-form + zod
- react-icons

## How to Get Started

1. **Clone this repository:**

```bash
git clone https://github.com/your-username/html-web-pages.git
cd html-web-pages
```

2. **Install dependencies and run the dev server:**

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

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
