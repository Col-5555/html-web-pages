# Workspace (Coding Lab) — Step-by-Step Walkthrough

This document explains how the Coders **workspace** was built: the two-way split
screen, the markdown challenge description, the CodeMirror editor with language /
font-size config, and the test-cases panel — reached at `/workspace/:challengeId`.

It builds on the challenges home page from the previous assignment.

---

## The big picture

The workspace is one page split into resizable panes:

```
Workspace  (/workspace/:challengeId)
├─ Navbar
└─ Split (horizontal)                       ← react-split, drag to resize
   ├─ ChallengeDescription   (markdown)
   └─ Playground
      └─ Split (vertical)                    ← react-split again
         ├─ CodeEditor   (CodeMirror + config dropdowns)
         └─ TestCases    (case tabs + Submit)
```

Three new libraries do the heavy lifting:

| Library | Job |
| --- | --- |
| `react-split` | drag-resizable split panes |
| `@uiw/react-markdown-preview` | render the challenge markdown |
| `@uiw/react-codemirror` | the code editor (+ `@codemirror/lang-javascript` / `-python`) |

---

## Step 1: The route parameter

The page is registered with a **URL parameter**:

```jsx
<Route path="/workspace/:challengeId" element={<Workspace />} />
```

`Workspace` reads that param and looks up the challenge in our data:

```jsx
const { challengeId } = useParams();
const challenge = challenges.find((c) => String(c.id) === challengeId);
```

(The id in the URL is a string, so we compare with `String(c.id)`.) On the home
page, each challenge title is now a `<Link to={`/workspace/${challenge.id}`}>`, so
clicking a row opens its lab.

---

## Step 2: Splitting the screen with `react-split`

`react-split` renders draggable panes. The outer split is **horizontal**
(description | playground):

```jsx
<Split direction="horizontal" sizes={[45, 55]} minSize={280} gutterSize={8}>
  <ChallengeDescription challenge={challenge} />
  <Playground challenge={challenge} />
</Split>
```

`Playground` uses a second, **vertical** split (editor over tests):

```jsx
<Split direction="vertical" sizes={[60, 40]} minSize={100} gutterSize={8}>
  <CodeEditor />
  <TestCases tests={challenge.tests} />
</Split>
```

The draggable dividers ("gutters") are styled in `index.css` — a horizontal
split needs `display: flex` on its container, and the gutters get the right
resize cursor:

```css
.split-horizontal { display: flex; flex-direction: row; }
.gutter.gutter-horizontal { cursor: col-resize; }
.gutter.gutter-vertical   { cursor: row-resize; }
```

---

## Step 3: Rendering markdown

Each challenge's `description` is a markdown string (see `src/data/challenges.js`).
`@uiw/react-markdown-preview` turns it into formatted HTML:

```jsx
<div data-color-mode={mode}>
  <MarkdownPreview source={challenge.description} />
</div>
```

The `data-color-mode={mode}` wrapper (read from the Redux `theme` slice) makes the
rendered markdown follow the app's light/dark theme automatically.

---

## Step 4: The code editor + Redux config

The editor is `@uiw/react-codemirror`. Two settings live in a new Redux
**`workspace`** slice so the config dropdowns and the editor stay in sync:

```js
// src/redux/workspaceSlice.js
initialState: { language: "javascript", fontSize: 16 }
reducers:     { setLanguage, setFontSize }
```

`CodeEditor` reads them and feeds CodeMirror:

```jsx
const { language, fontSize } = useSelector((s) => s.workspace);
const mode = useSelector((s) => s.theme.mode);

const languageExtension = language === "python" ? python() : javascript();
const fontSizeExtension = EditorView.theme({ "&": { fontSize: `${fontSize}px` } });

<CodeMirror
  value={code}
  onChange={setCode}
  theme={mode === "dark" ? "dark" : "light"}
  extensions={[languageExtension, fontSizeExtension]}
/>
```

- **Language** switches the syntax highlighting extension (JS ↔ Python).
- **Font size** is applied through a tiny CodeMirror theme extension.
- **Theme** follows the app theme, so dark mode dims the editor too.

---

## Step 5: A reusable DropDown

The brief asks for a `DropDown` component rather than a native `<select>`, so
`DropDown.jsx` is a small reusable control (button + list, closing on outside
click — the same pattern as the Navbar profile menu):

```jsx
<DropDown value={language} options={LANGUAGE_OPTIONS}
          onChange={(v) => dispatch(setLanguage(v))} />
<DropDown value={fontSize} options={FONT_SIZE_OPTIONS}
          onChange={(v) => dispatch(setFontSize(v))} />
```

It takes `{ value, options: [{ value, label }], onChange }`, so it works for both
the language and font-size menus (and anything later).

---

## Step 6: Test cases + Submit

`TestCases` shows one tab per case; the active tab's input and expected output are
displayed below:

```jsx
const [activeIndex, setActiveIndex] = useState(0);
const activeTest = tests[activeIndex];
```

The grading backend comes in a later assignment, so **Submit** just shows a mock
confirmation for now:

```jsx
const handleSubmit = () => setSubmitted(true);   // later: POST to grading service
```

---

## Trying it out

```bash
npm install   # picks up react-split, @uiw/react-codemirror, @uiw/react-markdown-preview, lang extensions
npm run dev
```

1. Sign in → on the home page, click a challenge title.
2. The workspace opens: description on the left, editor + tests on the right.
3. Drag the middle gutter (and the one between editor/tests) to resize.
4. Toggle the theme (navbar) → the markdown **and** the editor switch light/dark.
5. Change **Language** → syntax highlighting changes; change **font size** → the
   editor text resizes.
6. Click **Case 1 / Case 2** → the input and expected output update.
7. Click **Submit** → a "Submitted!" confirmation appears.

---

## A note on bundle size

CodeMirror and the markdown preview are large libraries, so the production bundle
is noticeably bigger now (Vite prints a "chunk larger than 500 kB" warning). It's
just a warning — a later optimisation could `React.lazy`-load the workspace so the
editor only downloads when a coder actually opens a challenge.

---

## What's next

The workspace UI is ready for real data: upcoming assignments add the backend and
wire the description, test cases, and Submit button to live grading.
