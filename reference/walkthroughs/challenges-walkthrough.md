# Challenges (Home) Page — Step-by-Step Walkthrough

This document explains how the Coders **home page** was built: the challenges
table, category filter, trending categories, top-coders sidebar, and the
light/dark **theme toggle** driven by Redux.

It follows the tasks from the *Challenges Page* brief and builds on the auth app
from the previous assignment.

---

## The big picture

The home page is one `Home` page component made of small, focused components:

```
Home
├─ Navbar                 logo · links · theme toggle · avatar dropdown
├─ main
│   ├─ CategoriesList → Category (×n)      the filter pills
│   └─ ChallengesList → StatusIcon, DifficultyBadge
└─ aside
    ├─ TrendingCategoriesBox
    └─ TopKCodersList → CoderCard (×4)
```

Each component reads from a small **dummy-data** file in `src/data/` — there's no
backend yet, so the data is hard-coded but shaped like a real API response.

---

## Step 1: The dummy data

`src/data/` holds four plain arrays:

- `challenges.js` — `{ id, title, category, difficulty, status, solutionRate, … }`
- `categories.js` — `["Data structure", "Graphs", "Databases"]`
- `trendingCategories.js` — `{ category, count }` pairs
- `topCoders.js` — `{ id, first_name, last_name, avatar_url, score }`

Keeping data separate from components means later we only swap these files for
real API calls; the components don't change.

---

## Step 2: Rendering a list with `.map()`

Every list component follows the same React pattern — map an array to JSX and
give each item a stable `key`:

```jsx
{topCoders.map((coder, index) => (
  <CoderCard key={coder.id} coder={coder} rank={index + 1} />
))}
```

`CategoriesList`, `ChallengesList`, `TrendingCategoriesBox`, and `TopKCodersList`
all work this way.

---

## Step 3: Icons with `react-icons`

The status column uses the icons named in the brief, imported from `react-icons`:

```jsx
import { BsCheck2Circle } from "react-icons/bs";      // Completed
import { LuFileSpreadsheet } from "react-icons/lu";   // Attempted
import { FaRegHourglass } from "react-icons/fa6";     // Pending
```

`StatusIcon.jsx` maps a status string to `{ Icon, colour, description }`, so the
table row just renders `<StatusIcon status={challenge.status} />`.

### Tooltip on hover — no library needed

The tooltip is pure Tailwind. The wrapper is a `group`; the label starts at
`opacity-0` and fades in on `group-hover`:

```jsx
<span className="group relative ...">
  <Icon />
  <span className="absolute ... opacity-0 group-hover:opacity-100">
    {description}
  </span>
</span>
```

---

## Step 4: The category filter

The selected category lives in `Home` as React state and is passed down:

```jsx
const [selectedCategory, setSelectedCategory] = useState("All");

const visibleChallenges =
  selectedCategory === "All"
    ? challenges
    : challenges.filter((c) => c.category === selectedCategory);
```

`CategoriesList` renders an **"All"** pill plus one `Category` per entry, marks
the active one, and calls `onSelect` when clicked. `ChallengesList` only ever
receives the already-filtered array — it doesn't know filtering exists.

---

## Step 5: The scrollable table

A long table shouldn't push the page around, so the table sits in a scroll
container with a sticky header:

```jsx
<div className="max-h-[60vh] overflow-auto ...">
  <table className="min-w-[640px] ...">
    <thead className="sticky top-0 ...">...</thead>
    ...
  </table>
</div>
```

`overflow-auto` handles both vertical (long list) and horizontal (narrow screen)
overflow.

---

## Step 6: The Navbar dropdown

The avatar opens a Profile/Logout menu. A `useState` boolean tracks whether it's
open, and a `useEffect` closes it when you click outside:

```jsx
const [menuOpen, setMenuOpen] = useState(false);
const menuRef = useRef(null);

useEffect(() => {
  const onClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
  };
  document.addEventListener("mousedown", onClick);
  return () => document.removeEventListener("mousedown", onClick);
}, []);
```

**Logout** dispatches the `logout` action from the auth slice and navigates back
to `/signin` — reusing the exact plumbing from the previous assignment.

---

## Step 7: The theme toggle (Redux + Tailwind)

This is the headline feature. It has three parts.

### 7a. A Redux theme slice

`src/redux/themeSlice.js` stores the mode and can flip it. The initial value is
read back from `localStorage`, so the choice **survives a reload** (the optional
bonus):

```js
const initialState = { mode: localStorage.getItem("theme") || "light" };

toggleTheme: (state) => {
  state.mode = state.mode === "light" ? "dark" : "light";
  localStorage.setItem("theme", state.mode);
}
```

It's registered in the store next to `auth`:

```js
reducer: { auth: authReducer, theme: themeReducer }
```

### 7b. Tailwind class-based dark mode

`tailwind.config.js` opts into class-based dark mode:

```js
darkMode: "class",
```

Now any `dark:` class (e.g. `dark:bg-navbar-dark`) only applies when the `<html>`
element has the `dark` class. The dark colours come from the intro brief and were
already registered as `navbar.dark`, `appbg.dark`, etc.

### 7c. Syncing Redux → the DOM

`App.jsx` bridges the two: whenever the Redux mode changes, it toggles the `dark`
class on `<html>`:

```jsx
const themeMode = useSelector((s) => s.theme.mode);
useEffect(() => {
  document.documentElement.classList.toggle("dark", themeMode === "dark");
}, [themeMode]);
```

The toggle button itself (`ThemeToggle.jsx`) just dispatches `toggleTheme` and
shows a sun or moon (`react-icons`). Font colour follows via
`text-black dark:text-white` on each page wrapper.

**Flow:** click toggle → dispatch `toggleTheme` → Redux mode flips + saved to
localStorage → `App` effect adds/removes `dark` on `<html>` → every `dark:` class
re-styles instantly.

---

## Step 8: Routing

The home page is reachable at both `/` and `/challenges`, and the new stub pages
are wired in too — all behind `ProtectedRoute`:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Home />} />
  <Route path="/challenges" element={<Home />} />
  <Route path="/leaderboard" element={<Leaderboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>
```

`Leaderboard` and `Profile` are "coming soon" placeholders so no nav link
dead-ends — they'll be filled in by later assignments.

---

## Trying it out

```bash
npm install   # picks up react-icons
npm run dev
```

1. Sign in → you land on the challenges home page.
2. Hover a status icon → a tooltip shows the status.
3. Click a category pill → the table filters (try "Graphs" vs "All").
4. Click the avatar → Profile / Logout dropdown; click outside → it closes.
5. Click the sun/moon → the whole app switches theme; **reload the page** and it
   stays on your last choice.
6. Click Leaderboard / Profile → their placeholder pages load.

---

## What's next

The navbar, theme system, and sidebar are reusable across the rest of the app.
Upcoming assignments fill in the real Leaderboard and Profile pages and the
challenge coding-lab.
