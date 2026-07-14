# Tailwind CSS Refactor — Step-by-Step Walkthrough

This document explains how the CodeCLA website was refactored from a custom
`styles.css` file to Tailwind CSS utility classes.

---

## What is Tailwind CSS?

Tailwind is a **utility-first** CSS framework. Instead of writing CSS rules in
a separate file, you apply small, single-purpose classes directly in your HTML.

**Traditional CSS approach:**

```css
/* styles.css */
.hero-button {
  background-color: #8053FF;
  color: #f4f4f4;
  padding: 12px 25px;
  border-radius: 5px;
  font-weight: 600;
}
```

```html
<button class="hero-button">Join Now</button>
```

**Tailwind approach:**

```html
<button class="bg-purple text-light px-6 py-3 rounded font-semibold">
  Join Now
</button>
```

No separate CSS file needed — the styling lives right on the element.

---

## Step 1: Adding Tailwind to the Project

### Before (custom CSS)

```html
<link rel="stylesheet" href="styles.css" />
```

### After (Tailwind CDN)

```html
<script src="https://cdn.tailwindcss.com"></script>
```

Tailwind is loaded as a script (not a stylesheet) because the CDN version
analyses your HTML at runtime and generates only the CSS classes you actually
use.

### Custom Configuration

Tailwind ships with a default colour palette (e.g. `blue-500`, `gray-200`),
but our project uses specific brand colours. We register them in a config
block so they work as Tailwind classes:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          navy: "#23155B",
          purple: "#8053FF",
          muted: "#817d8e",
          light: "#f4f4f4",
          skyblue: "#4AA3DF",
        },
        fontFamily: {
          martel: ["Martel Sans", "sans-serif"],
        },
      },
    },
  };
</script>
```

**What this enables:**

| Config key | Tailwind classes created |
|---|---|
| `navy: "#23155B"` | `text-navy`, `bg-navy`, `border-navy` |
| `purple: "#8053FF"` | `text-purple`, `bg-purple`, `border-purple` |
| `muted: "#817d8e"` | `text-muted` |
| `light: "#f4f4f4"` | `text-light`, `bg-light` |
| `skyblue: "#4AA3DF"` | `bg-skyblue` |
| `martel: [...]` | `font-martel` |

The `extend` key is important — it **adds** our colours alongside Tailwind's
defaults rather than replacing them.

### Google Font (unchanged)

The font import stays as a regular stylesheet link. Tailwind handles the
font-family assignment via the `font-martel` class, but the actual font files
still need to be loaded from Google Fonts:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Martel+Sans:wght@400;600;700;800;900&display=swap"
/>
```

---

## Step 2: The Body Element

### Before

```css
body {
  font-family: 'Martel Sans', sans-serif;
  background-color: #f4f4f4;
  color: #23155B;
}
```

### After

```html
<body class="m-0 p-0 font-martel bg-light text-navy">
```

| Class | CSS equivalent | Purpose |
|---|---|---|
| `m-0` | `margin: 0` | Reset default body margin |
| `p-0` | `padding: 0` | Reset default body padding |
| `font-martel` | `font-family: 'Martel Sans', sans-serif` | Our custom font |
| `bg-light` | `background-color: #f4f4f4` | Light grey background |
| `text-navy` | `color: #23155B` | Default dark navy text colour |

---

## Step 3: Header / Navigation

### Before

```css
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  background-color: #f4f4f4;
}
```

### After

```html
<header class="flex flex-col md:flex-row items-center justify-between px-5 md:px-10 py-4 bg-light gap-4 md:gap-0">
```

| Class | What it does |
|---|---|
| `flex` | `display: flex` — enables flexbox layout |
| `flex-col` | `flex-direction: column` — stacks children vertically (mobile) |
| `md:flex-row` | `flex-direction: row` at 768px+ — places children side by side (desktop) |
| `items-center` | `align-items: center` — vertically centres children |
| `justify-between` | `justify-content: space-between` — pushes children to edges |
| `px-5` | `padding-left: 20px; padding-right: 20px` (mobile) |
| `md:px-10` | `padding-left: 40px; padding-right: 40px` (desktop) |
| `py-4` | `padding-top: 16px; padding-bottom: 16px` |
| `bg-light` | `background-color: #f4f4f4` |
| `gap-4` | `gap: 16px` between flex children (mobile) |
| `md:gap-0` | `gap: 0` on desktop (items space themselves with `justify-between`) |

### Navigation links

**Before:**

```css
header a {
  text-decoration: none;
  color: #23155B;
  margin-right: 20px;
  font-weight: 600;
}
```

**After:**

```html
<a href="/" class="text-navy font-semibold mr-5 no-underline">For Coders</a>
```

| Class | CSS equivalent |
|---|---|
| `text-navy` | `color: #23155B` |
| `font-semibold` | `font-weight: 600` |
| `mr-5` | `margin-right: 20px` |
| `no-underline` | `text-decoration: none` |

---

## Step 4: Hero Section

### Before

```css
#hero {
  text-align: center;
  padding: 80px 40px;
}

#hero h2 {
  font-size: 2.2rem;
  margin-bottom: 20px;
}

#hero p {
  color: #817d8e;
  max-width: 700px;
  margin: 0 auto 30px auto;
}
```

### After

```html
<section class="text-center py-12 md:py-20 px-5 md:px-10">
  <h2 class="text-2xl md:text-4xl mb-5">
    The place for Competitive Programmers
  </h2>
  <p class="text-muted max-w-[700px] mx-auto mb-8 text-base leading-relaxed">
    ...
  </p>
</section>
```

**New concept — arbitrary values with square brackets:**

`max-w-[700px]` is an **arbitrary value**. Tailwind's default scale doesn't
include exactly 700px, so the square bracket syntax lets you use any CSS value
inline. This generates `max-width: 700px`.

Other examples used in the project:
- `max-w-[500px]`, `max-w-[400px]`, `max-w-[550px]`
- `min-h-[120px]`
- `rounded-tl-[100px]`

---

## Step 5: Statistics Grid

### Before

```css
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.stat-box {
  background-color: #f4f4f4;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
}
```

### After

```html
<div class="grid grid-cols-2 gap-5 max-w-[600px] mx-auto">
  <div class="bg-light border border-gray-200 rounded-lg p-6">
    <h3 class="text-2xl text-navy mb-1">1K</h3>
    <p class="text-muted text-sm">Problems for practice</p>
  </div>
  <!-- more stat boxes... -->
</div>
```

| Class | CSS equivalent |
|---|---|
| `grid` | `display: grid` |
| `grid-cols-2` | `grid-template-columns: repeat(2, minmax(0, 1fr))` — two equal columns |
| `gap-5` | `gap: 20px` |
| `border` | `border-width: 1px` (adds the border) |
| `border-gray-200` | `border-color: #e5e7eb` (Tailwind's built-in light grey) |
| `rounded-lg` | `border-radius: 8px` |
| `p-6` | `padding: 24px` |

---

## Step 6: Feature Cards (For Coders / For Managers)

### Before

```css
.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f4f4f4;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}
```

### After

```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mb-8">
  <div class="flex items-center gap-4 bg-light border border-gray-200 rounded-lg p-5">
    <img src="assets/ok.svg" alt="ok" class="w-6 h-6 shrink-0" />
    <div>
      <h4 class="text-sm font-bold text-navy mb-1">Rich practice set of problems</h4>
      <p class="text-sm text-muted leading-relaxed">...</p>
    </div>
  </div>
</div>
```

**Responsive grid:**

| Class | Effect |
|---|---|
| `grid-cols-1` | Single column on mobile (default) |
| `md:grid-cols-2` | Two columns at 768px and above |

**Image utility:**

| Class | CSS equivalent | Purpose |
|---|---|---|
| `w-6` | `width: 24px` | Fixed icon width |
| `h-6` | `height: 24px` | Fixed icon height |
| `shrink-0` | `flex-shrink: 0` | Prevents the icon from shrinking when text is long |

---

## Step 7: Showcase Section

### Before

```css
#showcase {
  display: flex;
  align-items: stretch;
  margin: 60px 40px;
  overflow: hidden;
}

.showcase-image {
  flex: 0 0 40%;
}
```

### After

```html
<section class="flex flex-col md:flex-row items-stretch mx-5 md:mx-10 my-10 md:my-16 bg-light overflow-hidden">
  <div class="md:w-2/5 shrink-0">
    <img
      src="assets/team.svg"
      alt="Team working"
      class="w-4/5 aspect-square md:aspect-auto md:h-4/5 object-cover block mx-auto md:mx-0 rounded-[30px] md:rounded-none md:rounded-r-[100px]"
    />
  </div>
</section>
```

**New classes used:**

| Class | CSS equivalent | Purpose |
|---|---|---|
| `items-stretch` | `align-items: stretch` | Both panels fill the same height |
| `md:w-2/5` | `width: 40%` | Image panel takes 40% width on desktop |
| `aspect-square` | `aspect-ratio: 1 / 1` | Square image on mobile |
| `md:aspect-auto` | `aspect-ratio: auto` | Natural aspect ratio on desktop |
| `object-cover` | `object-fit: cover` | Image fills its box without distortion |
| `overflow-hidden` | `overflow: hidden` | Clips the rounded image corners cleanly |
| `rounded-[30px]` | `border-radius: 30px` | Rounded corners on mobile |
| `md:rounded-r-[100px]` | `border-radius: 0 100px 100px 0` | Right side rounded on desktop |

---

## Step 8: Testimonials Section

### Before

```css
.testimonial-card {
  background-color: #fff;
  border-radius: 15px;
  padding: 40px 30px;
  max-width: 550px;
  margin: 0 auto;
}

.arrow {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  width: 35px;
  height: 35px;
}
```

### After

```html
<div class="bg-white rounded-2xl py-10 px-5 md:px-8 max-w-[550px] mx-auto">
```

```html
<button
  id="prev-btn"
  class="bg-transparent border border-gray-200 rounded-full w-9 h-9 text-lg text-muted cursor-pointer shrink-0 flex items-center justify-center"
>
```

| Class | CSS equivalent |
|---|---|
| `bg-white` | `background-color: #ffffff` |
| `rounded-2xl` | `border-radius: 16px` (close to 15px) |
| `bg-transparent` | `background: transparent` |
| `rounded-full` | `border-radius: 50%` — makes a circle |
| `w-9 h-9` | `width: 36px; height: 36px` (close to 35px) |

### Dot indicators — the one exception

The dot indicators use a small `<style>` block rather than Tailwind classes:

```html
<style>
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #d0d0d0;
  }
  .dot.active {
    background-color: #8053ff;
  }
</style>
```

**Why?** JavaScript toggles the `active` class on and off via
`classList.add("active")` and `classList.remove("active")`. Tailwind generates
CSS at load time based on classes found in the HTML — it won't generate a rule
for a class that JavaScript adds dynamically. So we keep these two tiny rules
in a `<style>` block.

---

## Step 9: Contact Form

### Before

```css
#contact {
  background-color: #23155B;
  color: #f4f4f4;
  padding: 80px 40px 60px;
  border-radius: 100px 0 0 0;
}

#contact input,
#contact textarea {
  padding: 12px 15px;
  border: none;
  border-radius: 5px;
  font-family: 'Martel Sans', sans-serif;
  font-size: 0.9rem;
  margin-bottom: 20px;
}
```

### After

```html
<section class="bg-navy text-light py-16 md:py-20 px-5 md:px-10 rounded-tl-[60px] md:rounded-tl-[100px]">
```

```html
<input
  type="text"
  id="name"
  name="name"
  placeholder="Your Name"
  required
  class="p-3 border-none rounded text-sm mb-5 outline-none font-martel"
/>
<span class="text-red-400 text-xs -mt-3 mb-2" id="name-error"></span>
```

**Error message styling (previously in CSS):**

| Before (CSS) | After (Tailwind) | Meaning |
|---|---|---|
| `color: #ff6b6b` | `text-red-400` | Red error text |
| `font-size: 0.8rem` | `text-xs` | Small font size |
| `margin-top: -12px` | `-mt-3` | Negative margin pulls it up into the gap |
| `margin-bottom: 8px` | `mb-2` | Small bottom spacing |

**New concept — negative values with a dash prefix:**

`-mt-3` creates `margin-top: -12px`. In Tailwind, prefixing a spacing class
with `-` makes the value negative. This is how the error message tucks up
into the space between the input and the next label.

---

## Step 10: Footer

### Before

```css
footer {
  background-color: #23155B;
  text-align: center;
  padding: 20px 40px;
  border-top: 1px solid #3a2a7a;
}
```

### After

```html
<footer class="bg-navy text-center py-5 px-5 md:px-10 border-t border-[#3a2a7a]">
  <p class="text-light text-sm">
    (c) <span id="copyright-year">2026</span> Your Competative Programming
    Platform. All rights reserved.
  </p>
</footer>
```

`border-[#3a2a7a]` uses the arbitrary value syntax for the border colour,
since this specific shade isn't in Tailwind's default palette or our custom
config.

---

## Step 11: Sign In / Sign Up Pages

### Before

```css
#sign-in {
  display: flex;
  min-height: 100vh;
}

.signin-left {
  flex: 0 0 50%;
  background-color: #23155B;
}

.signin-card input {
  padding: 14px 15px;
  background-color: #23155B;
  border: none;
  border-radius: 8px;
  color: #f4f4f4;
}

.signin-card input::placeholder {
  color: #a0a0b0;
}
```

### After

```html
<section class="flex flex-col md:flex-row min-h-screen">
  <div class="flex items-center justify-center bg-navy md:w-1/2 min-h-[40vh] md:min-h-0">
    <img src="assets/coding.png" alt="Coder illustration" class="max-w-[250px]" />
  </div>
  <div class="flex-1 bg-light flex items-center justify-center py-8 px-5">
    <div class="bg-white rounded-lg p-10 w-full max-w-[400px] text-center">
```

```html
<input
  type="email"
  placeholder="Email"
  class="p-3.5 bg-navy border-none rounded-lg text-light font-martel text-sm outline-none placeholder:text-[#a0a0b0]"
/>
```

**New concept — pseudo-class modifiers:**

`placeholder:text-[#a0a0b0]` targets the `::placeholder` pseudo-element.
In Tailwind, pseudo-classes and pseudo-elements are written as prefixes
separated by a colon:

| Tailwind | CSS equivalent |
|---|---|
| `placeholder:text-[#a0a0b0]` | `input::placeholder { color: #a0a0b0 }` |
| `hover:bg-purple` | `element:hover { background-color: #8053FF }` |
| `focus:outline-none` | `element:focus { outline: none }` |

Each page (signin.html, signup.html) includes its own copy of the Tailwind
CDN script and config block. This is necessary because each HTML file is a
standalone page — they don't share a common layout template.

---

## Tailwind Spacing Scale Reference

Tailwind uses a spacing scale where **1 unit = 4px**. This is used across
padding, margin, gap, width, and height classes:

| Class suffix | Pixels | Example class |
|---|---|---|
| `0` | 0px | `p-0` |
| `0.5` | 2px | `mb-0.5` |
| `1` | 4px | `mb-1` |
| `2` | 8px | `mb-2`, `gap-2` |
| `2.5` | 10px | `py-2.5`, `gap-2.5` |
| `3` | 12px | `p-3` |
| `3.5` | 14px | `p-3.5` |
| `4` | 16px | `gap-4`, `py-4` |
| `5` | 20px | `px-5`, `mb-5`, `gap-5` |
| `6` | 24px | `p-6`, `px-6` |
| `8` | 32px | `mb-8` |
| `10` | 40px | `p-10`, `px-10` |
| `12` | 48px | `py-12` |
| `16` | 64px | `py-16`, `h-16`, `w-16` |
| `20` | 80px | `py-20` |

---

## Tailwind Font Size Scale Reference

| Class | Font size | Rough equivalent |
|---|---|---|
| `text-xs` | 0.75rem (12px) | Very small text |
| `text-sm` | 0.875rem (14px) | Small text, captions |
| `text-base` | 1rem (16px) | Body text |
| `text-lg` | 1.125rem (18px) | Slightly larger |
| `text-xl` | 1.25rem (20px) | Subheadings |
| `text-2xl` | 1.5rem (24px) | Section headings |
| `text-3xl` | 1.875rem (30px) | Large headings |
| `text-4xl` | 2.25rem (36px) | Hero headings |

---

## Responsive Breakpoints Reference

Tailwind is **mobile-first**. Classes without a prefix apply to all screen
sizes. Prefixed classes apply at that breakpoint **and above**:

| Prefix | Min-width | Typical device |
|---|---|---|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |

**Example:**

```html
<div class="px-5 md:px-10">
```

- Below 768px: `padding-left: 20px; padding-right: 20px`
- At 768px and above: `padding-left: 40px; padding-right: 40px`

---

## What Stayed the Same

- **`script.js`** — completely unchanged. All JavaScript targets elements by
  `id` attributes, not CSS classes, so the Tailwind refactor had no impact.

- **`styles.css`** — the file still exists on disk but is no longer linked
  from any HTML page. It can be safely deleted.

---

## Summary of Files Changed

| File | What changed |
|---|---|
| `index.html` | Replaced `styles.css` link with Tailwind CDN + config. All CSS classes converted to Tailwind utility classes. Added tiny `<style>` block for dot indicators. |
| `signin.html` | Same Tailwind setup. All classes converted to Tailwind utilities. |
| `signup.html` | Same Tailwind setup. All classes converted to Tailwind utilities. |
| `styles.css` | No longer used — can be deleted. |
| `script.js` | No changes needed. |
