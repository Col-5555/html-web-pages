# Profile Page — Step-by-Step Walkthrough

This document explains how the Coders **profile** page was built — where coders
view and manage their details and see their performance stats. It's the last of
the original six pages.

---

## The big picture

The profile page is two columns at `/profile`:

```
Profile  (/profile)
├─ Navbar
├─ ProfileForm            (left)  — avatar upload, name, read-only email, bio, rank
└─ aside                  (right)
   ├─ CompletedChallenges — Easy/Moderate/Hard percentage bars
   └─ CodingStrikes       — submissions heatmap (@uiw/react-heat-map)
```

On small screens the two columns stack (`flex-col lg:flex-row`), and everything
follows the light/dark theme.

The `/profile` route and its navbar-dropdown link already existed (a stub from
the challenges assignment), so this task filled the page in.

---

## Step 1: Uploading and previewing an avatar

The avatar is a circle with a small pencil **edit icon**. That icon is actually a
`<label>` wrapping a hidden file input — clicking the pencil opens the file
picker:

```jsx
<label className="... cursor-pointer ...">
  <FaPencil />
  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
</label>
```

When a file is chosen, we read the first file and turn it into a previewable URL
with `URL.createObjectURL` (the brief's hint):

```jsx
const handleAvatarChange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current); // free the old one
  const url = URL.createObjectURL(file);
  objectUrlRef.current = url;
  setAvatarPreview(url);
};
```

`URL.createObjectURL` gives a temporary in-browser URL for the file, so the image
previews immediately without any upload. We keep the URL in a ref and
`revokeObjectURL` the previous one (and on unmount) to avoid memory leaks.

---

## Step 2: The form fields (email is read-only)

First name, last name, and bio are controlled inputs (`useState`). **Email** is
`readOnly` and pre-filled from the signed-in user, since a coder can't change it:

```jsx
const email = user?.email ?? "email@domain.com";
<input type="email" value={email} readOnly className="... cursor-not-allowed ..." />
```

The coder's **Rank** is shown in the corner, and **Update** is a mock for now —
it just shows a "Profile updated!" confirmation (the real save comes with the
backend).

---

## Step 3: Completed-challenges bars

`CompletedChallenges` renders one bar per difficulty. The percentage is computed
on the frontend from `solved / total` (the backend will send those two numbers):

```jsx
const percent = Math.round((solved / total) * 100);
<div className={`... ${color}`} style={{ width: `${percent}%` }}>
  {percent >= 12 && <span>{percent}%</span>}
</div>
```

Easy is green, Moderate amber, Hard red. The `solved / total` ratio is exposed as
the bar's `title` (hover) tooltip.

---

## Step 4: The coding-strikes heatmap

`CodingStrikes` uses `@uiw/react-heat-map`. The data is a year of `{ date, count }`
entries generated in `src/data/profile.js`, and the colours come straight from
the brief's `panelColors` object — picked by the current theme:

```jsx
const mode = useSelector((s) => s.theme.mode);

<HeatMap
  value={heatmapValue}
  startDate={heatmapStartDate}
  panelColors={panelColors[mode]}   // brief's light/dark colour scheme
  legendCellSize={0}
  rectRender={(props, data) => (
    <rect {...props}>
      <title>{`${data.count || 0} correct submissions`}</title>
    </rect>
  )}
/>
```

- `panelColors` maps count thresholds (0, 2, 4, 10, 20, 30) to colours, so busier
  days are darker.
- `rectRender` adds an SVG `<title>` to each day so hovering shows
  "N correct submissions".
- A small CSS rule (`.coding-strikes svg text { fill: currentColor }`) makes the
  month/weekday labels follow the theme text colour, while the coloured day cells
  keep their own fill.

---

## Trying it out

```bash
npm install   # picks up @uiw/react-heat-map
npm run dev
```

1. Sign in → open the avatar dropdown (top right) → **Profile**.
2. The form shows a rank, dummy name/bio, and your real (read-only) email.
3. Click the pencil → pick an image → it previews in the circle.
4. The Easy/Moderate/Hard bars show 60% / 20% / 2%.
5. The heatmap renders; toggle the theme → its palette flips (orange ↔ purple).
6. Narrow the window → the two columns stack.
7. Click **Update** → "Profile updated!".

---

## That's the six pages

With the profile page done, the app now has all six original screens: sign-in,
sign-up, challenges home, workspace, leaderboard, and profile. The recurring
"Note" in these briefs points to what's next: a **backend** to replace the dummy
data across the app with real data.
