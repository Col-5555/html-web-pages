# Leaderboard Page — Step-by-Step Walkthrough

This document explains how the Coders **leaderboard** page was built — a small
one, since most of the groundwork was already in place.

---

## The big picture

The leaderboard is a single table of the top coders, at `/leaderboard`:

```
Leaderboard  (/leaderboard)
├─ Navbar
└─ table: Rank · Name · Score · Solved Challenges
```

Two things already existed from earlier assignments, so this task was mostly
"fill in the blank":

- The **`/leaderboard` route** and a **stub page** (Navbar + "Coming soon") were
  added back in the challenges assignment so the navbar link wouldn't dead-end.
- The **themed table styling** was already worked out for the challenges table.

---

## Step 1: The dummy data

`src/data/leaderboard.js` holds the brief's sample rows:

```js
export const leaderboard = [
  { rank: 1, first_name: "John",  last_name: "Doe",     score: 400, solved_challenges: 150 },
  { rank: 2, first_name: "Alice", last_name: "Smith",   score: 350, solved_challenges: 140 },
  { rank: 3, first_name: "Emma",  last_name: "Johnson", score: 320, solved_challenges: 135 },
];
```

It's kept separate from `topCoders.js` (the home-page sidebar) because the shape
is different — this one carries `rank` and `solved_challenges` instead of an
avatar.

---

## Step 2: Mapping the data into a table

The page keeps its existing shell (Navbar + themed wrapper) and swaps the
"Coming soon" message for a table. Each row is one coder, and **Name** is the
first and last name joined:

```jsx
{leaderboard.map((coder) => (
  <tr key={coder.rank} className="border-t border-black/5 dark:border-white/10">
    <td className="p-3">{coder.rank}</td>
    <td className="p-3">{coder.first_name} {coder.last_name}</td>
    <td className="p-3">{coder.score}</td>
    <td className="p-3">{coder.solved_challenges}</td>
  </tr>
))}
```

The table reuses the same look as the challenges table — a scroll container, a
sticky header, and `dark:` classes — so it automatically follows the light/dark
theme toggle.

---

## Step 3: Routing (already done)

No routing change was needed. `/leaderboard` was already registered as a
protected route in `src/App.jsx`, and the Navbar already links to it:

```jsx
<Route path="/leaderboard" element={<Leaderboard />} />
```

---

## Trying it out

```bash
npm run dev
```

1. Sign in.
2. Click **Leaderboard** in the navbar.
3. The table shows the three coders with Rank / Name / Score / Solved Challenges.
4. Toggle the theme → the table switches light/dark.

---

## What's next

Per the brief, the leaderboard will be wired to **real backend data** once the
backend assignments are done — the `leaderboard` array is the only thing that
changes; the table stays the same.
