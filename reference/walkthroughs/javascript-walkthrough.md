# JavaScript Additions — Step-by-Step Walkthrough

This document covers the three JavaScript features added to the CodeCLA website:

1. **Testimonial Carousel** — cyclic navigation with auto-play
2. **Dynamic Copyright Year** — using the Date API
3. **Contact Form Validation** — with error messages and SweetAlert popup

---

## 1. Testimonial Carousel

### What it does

- Clicking "Next" or "Previous" cycles through 5 testimonials
- Navigation is **cyclic** (wraps around in both directions)
- Testimonials auto-advance every 3 seconds using `setInterval`

### 1.1 HTML Changes

We added `id` attributes to the elements that JavaScript needs to update:

```html
<div class="testimonial-body">
  <button class="arrow arrow-left" id="prev-btn">&#8249;</button>
  <p id="testimonial-text">...</p>
  <button class="arrow arrow-right" id="next-btn">&#8250;</button>
</div>
<div class="testimonial-author">
  <img id="testimonial-photo" src="..." alt="..." />
  <h3 id="testimonial-name">June Cha</h3>
  <p id="testimonial-position">Software Engineer</p>
</div>
```

We also linked the script file at the bottom of the `<body>`:

```html
  <script src="script.js"></script>
</body>
```

Placing it at the bottom ensures all HTML elements exist in the DOM before the
script tries to find them.

### 1.2 The Data Array

The testimonial data is hardcoded as an array of objects. Each object has four
properties: `name`, `position`, `photo` (a URL), and `text` (the review).

```js
const testimonials = [
  {
    name: "June Cha",
    position: "Software Engineer",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "This platform is an absolute game-changer..."
  },
  {
    name: "Iida Niskanen",
    position: "Data Engineer",
    photo: "https://randomuser.me/api/portraits/women/67.jpg",
    text: "I can't express enough how valuable..."
  },
  // ... 3 more objects
];
```

### 1.3 Grabbing DOM Elements

We use `document.getElementById()` to store references to the HTML elements
we need to update. We also use `document.querySelectorAll()` to get all
five dot indicators as a **NodeList** (similar to an array).

```js
const textEl     = document.getElementById("testimonial-text");
const photoEl    = document.getElementById("testimonial-photo");
const nameEl     = document.getElementById("testimonial-name");
const positionEl = document.getElementById("testimonial-position");
const prevBtn    = document.getElementById("prev-btn");
const nextBtn    = document.getElementById("next-btn");
const dots       = document.querySelectorAll(".dot");
```

### 1.4 Tracking State

A single variable keeps track of which testimonial is currently displayed:

```js
let currentIndex = 0;
```

This starts at `0` (the first testimonial). It will be updated each time the
user clicks a button or the auto-play timer fires.

### 1.5 The Display Function

`showTestimonial(index)` is the core function. It reads the testimonial object
at the given index and pushes its data into the DOM:

```js
function showTestimonial(index) {
  const t = testimonials[index];
  textEl.textContent = t.text;         // update the quote text
  photoEl.src = t.photo;               // update the image source
  photoEl.alt = t.name;                // update the alt text
  nameEl.textContent = t.name;         // update the author name
  positionEl.textContent = t.position; // update the job title

  // Update dots: remove "active" from all, add to current
  dots.forEach((dot) => dot.classList.remove("active"));
  dots[index].classList.add("active");
}
```

**How the dots work:**
- `dots.forEach(...)` loops through every dot and removes the `active` class
- `dots[index]` targets just the dot that matches the current testimonial and
  adds `active` back — this is what makes the purple highlight move

### 1.6 Navigation Functions (Cyclic)

```js
function nextTestimonial() {
  currentIndex = (currentIndex + 1) % testimonials.length;
  showTestimonial(currentIndex);
}

function prevTestimonial() {
  currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
  showTestimonial(currentIndex);
}
```

**The modulo operator (`%`)** is the key to cyclic navigation:

- **Next:** `(currentIndex + 1) % 5` means:
  - At index 0 → `(0+1) % 5 = 1`
  - At index 3 → `(3+1) % 5 = 4`
  - At index 4 → `(4+1) % 5 = 0` (wraps back to the start!)

- **Previous:** `(currentIndex - 1 + 5) % 5` means:
  - At index 2 → `(2-1+5) % 5 = 1`
  - At index 0 → `(0-1+5) % 5 = 4` (wraps to the last!)
  - We add `testimonials.length` (5) before subtracting to avoid negative numbers

### 1.7 Event Listeners

```js
nextBtn.addEventListener("click", function () {
  nextTestimonial();
  resetAutoPlay();
});

prevBtn.addEventListener("click", function () {
  prevTestimonial();
  resetAutoPlay();
});
```

`addEventListener("click", ...)` attaches a function that runs every time the
button is clicked. After navigating, we call `resetAutoPlay()` so the 3-second
timer restarts from zero (explained next).

### 1.8 Auto-Play with setInterval

```js
let autoPlayInterval = setInterval(nextTestimonial, 3000);
```

`setInterval(function, milliseconds)` calls the given function repeatedly at
the specified interval. Here it calls `nextTestimonial` every 3000ms (3 seconds),
creating an infinite automatic loop.

```js
function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = setInterval(nextTestimonial, 3000);
}
```

**Why reset?** Imagine the auto-play is about to fire in 0.5 seconds, and the
user clicks "Next". Without resetting, the timer would fire almost immediately
after their click, causing a jarring double-jump. `clearInterval()` cancels
the old timer, and we start a fresh 3-second countdown.

### 1.9 Initial Display

```js
showTestimonial(currentIndex);
```

This runs immediately when the script loads, populating the card with the first
testimonial's data.

---

## 2. Dynamic Copyright Year

### What it does

Instead of a hardcoded year like "2026", the footer always displays the
current year automatically.

### 2.1 HTML Change

The year is wrapped in a `<span>` with an `id`:

```html
<footer>
  <p>
    (c) <span id="copyright-year">2026</span> Your Competative Programming
    Platform. All rights reserved.
  </p>
</footer>
```

The hardcoded `2026` acts as a fallback — if JavaScript is disabled, users
still see a year.

### 2.2 JavaScript

```js
const yearEl = document.getElementById("copyright-year");
yearEl.textContent = new Date().getFullYear();
```

**Line by line:**

1. `new Date()` — creates a **Date object** representing the current date and
   time at the moment the page loads.

2. `.getFullYear()` — a method on the Date object that returns the four-digit
   year (e.g., `2026`).

3. `yearEl.textContent = ...` — replaces the span's text with the result.

When this page loads in 2027, 2028, etc., the year updates automatically
without anyone touching the HTML.

---

## 3. Contact Form Validation

### What it does

- Checks that all required fields are filled in when the user clicks "Submit"
- Shows a red error message below any empty/invalid field
- Clears the error when the user focuses (clicks into) that field
- On successful submission, shows a SweetAlert2 popup with a tick icon

### 3.1 HTML Changes

**SweetAlert2 library** — loaded via CDN in the `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
```

This gives us access to the `Swal.fire()` function.

**Form changes:**

```html
<form id="contact-form" novalidate>
```

- `id="contact-form"` — so JavaScript can find the form
- `novalidate` — tells the browser: "don't show your built-in validation
  popups, we're handling it ourselves"

**Error spans** — an empty `<span>` added after each input:

```html
<input type="text" id="name" name="name" placeholder="Your Name" required />
<span class="error-message" id="name-error"></span>

<input type="email" id="email" name="email" placeholder="Your Email" required />
<span class="error-message" id="email-error"></span>

<textarea id="message" name="message" placeholder="Your Message" required></textarea>
<span class="error-message" id="message-error"></span>
```

These spans are initially empty (invisible). JavaScript fills them with text
when validation fails.

### 3.2 CSS for Error Messages

```css
.error-message {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: -12px;
  margin-bottom: 8px;
  min-height: 0;
}
```

- `color: #ff6b6b` — a soft red that's visible on the dark background
- `margin-top: -12px` — pulls the error text up into the existing gap between
  the input and the next label, so it doesn't push the layout around

### 3.3 JavaScript — Grabbing Elements

```js
const contactForm  = document.getElementById("contact-form");
const nameInput    = document.getElementById("name");
const emailInput   = document.getElementById("email");
const messageInput = document.getElementById("message");

const nameError    = document.getElementById("name-error");
const emailError   = document.getElementById("email-error");
const messageError = document.getElementById("message-error");
```

We store references to both the inputs (to read their values) and the error
spans (to write error messages into).

### 3.4 Email Validation Helper

```js
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

This uses a **regular expression** (regex) to check the email format:

| Part | Meaning |
|------|---------|
| `^` | Start of string |
| `[^\s@]+` | One or more characters that are NOT spaces or `@` |
| `@` | A literal `@` symbol |
| `[^\s@]+` | One or more characters (the domain name) |
| `\.` | A literal `.` (dot) |
| `[^\s@]+` | One or more characters (the extension, e.g., `com`) |
| `$` | End of string |

So `hello@example.com` passes, but `hello@` or `@example` or just `hello` would fail.

The `.test()` method returns `true` if the string matches the pattern,
`false` otherwise.

### 3.5 Clearing Errors on Focus

```js
nameInput.addEventListener("focus", function () {
  nameError.textContent = "";
});

emailInput.addEventListener("focus", function () {
  emailError.textContent = "";
});

messageInput.addEventListener("focus", function () {
  messageError.textContent = "";
});
```

The `"focus"` event fires when a user clicks into (or tabs to) an input field.
When that happens, we set the corresponding error span's `textContent` to an
empty string, making it disappear.

### 3.6 Form Submission Handler

```js
contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  let isValid = true;

  // Validate name
  if (nameInput.value.trim() === "") {
    nameError.textContent = "Name is required";
    isValid = false;
  }

  // Validate email
  if (emailInput.value.trim() === "") {
    emailError.textContent = "Email is required";
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailError.textContent = "Please enter a valid email address";
    isValid = false;
  }

  // Validate message
  if (messageInput.value.trim() === "") {
    messageError.textContent = "Message is required";
    isValid = false;
  }

  // Success
  if (isValid) {
    Swal.fire({
      icon: "success",
      title: "Thank you for reaching out",
      confirmButtonText: "OK",
      confirmButtonColor: "#4AA3DF",
    });
    contactForm.reset();
  }
});
```

**Walking through this step by step:**

1. **`e.preventDefault()`** — the `submit` event normally causes the browser
   to navigate to the form's `action` URL. `preventDefault()` stops that so
   we can handle everything in JavaScript.

2. **`let isValid = true`** — we assume the form is valid and set this to
   `false` if any check fails.

3. **Validation checks** — for each field:
   - `.value` gets what the user typed
   - `.trim()` removes whitespace from both ends (so a field with only spaces
     counts as empty)
   - `=== ""` checks if the trimmed result is an empty string
   - If empty, we set the error span's text and mark `isValid = false`
   - For email, there's a second check: if it's not empty but fails the
     format check, we show a different error message

4. **Success path** — only runs if `isValid` is still `true` (all checks passed):
   - `Swal.fire({...})` shows the SweetAlert2 popup:
     - `icon: "success"` — displays the green tick/checkmark icon
     - `title: "Thank you for reaching out"` — the message text
     - `confirmButtonText: "OK"` — label on the button
     - `confirmButtonColor: "#4AA3DF"` — makes the button blue
   - `contactForm.reset()` — clears all input fields back to empty

---

## Key JavaScript Concepts Used

| Concept | Where Used | What It Does |
|---------|-----------|--------------|
| `document.getElementById()` | Throughout | Finds an HTML element by its `id` attribute |
| `document.querySelectorAll()` | Dots | Finds all elements matching a CSS selector |
| `.addEventListener()` | Buttons, inputs, form | Runs a function when an event (click, focus, submit) occurs |
| `.textContent` | Testimonials, errors, year | Gets or sets the text inside an element |
| `.classList.add()` / `.remove()` | Dots | Adds or removes a CSS class from an element |
| `.forEach()` | Dots | Loops through every item in a NodeList/array |
| `setInterval()` / `clearInterval()` | Auto-play | Repeats a function on a timer / cancels that timer |
| `new Date().getFullYear()` | Copyright | Gets the current four-digit year |
| `e.preventDefault()` | Form submit | Stops the browser's default behaviour |
| `.value.trim()` | Form validation | Gets input text with whitespace stripped |
| `Swal.fire()` | Form success | Shows a SweetAlert2 popup dialog |
| Modulo operator (`%`) | Cyclic navigation | Wraps a number back to 0 after reaching the maximum |
