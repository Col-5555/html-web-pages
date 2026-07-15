# React Auth Pages — Step-by-Step Walkthrough

This document explains how the static CodeCLA sign-in / sign-up pages were
re-built as a **React application** using Vite, TailwindCSS, React Router, Redux
Toolkit, and form validation with `react-hook-form` + `zod`.

It follows the six tasks from the *Coders Authentication Pages* brief.

---

## From static HTML to a React app

Previously each screen was its own HTML file (`signin.html`, `signup.html`) with
Tailwind loaded from a CDN and a `<form action="/submit">` that did nothing.

Now the whole thing is a single-page React app:

| Before                         | After                                    |
| ------------------------------ | ---------------------------------------- |
| `signin.html`, `signup.html`   | `src/pages/SignIn.jsx`, `SignUp.jsx`     |
| `<a href="signup.html">`       | `<Link to="/signup">` (no page reload)   |
| Tailwind CDN `<script>`        | Tailwind installed + built by Vite       |
| Form does nothing              | Validation → Redux auth state → redirect |

---

## Step 1: Scaffold the project with Vite

Vite is the build tool and dev server. The project uses the React template:

```bash
npm create vite@latest . -- --template react
npm install
```

Runtime libraries used by the tasks:

```bash
npm install react-router-dom @reduxjs/toolkit react-redux \
            react-hook-form zod @hookform/resolvers
```

`npm run dev` starts a hot-reloading dev server; `npm run build` produces a
production bundle in `dist/`.

---

## Step 2: Add TailwindCSS

Tailwind (v3) is installed as a real dependency instead of the CDN script:

```bash
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js` tells Tailwind which files to scan and registers our brand
colours (so classes like `bg-navy` and `text-purple` keep working):

```js
content: ["./index.html", "./src/**/*.{js,jsx}"],
theme: {
  extend: {
    colors: { navy: "#23155B", purple: "#8053FF", skyblue: "#4AA3DF", /* ... */ },
    fontFamily: { martel: ["Martel Sans", "sans-serif"] },
  },
},
```

The theme colours from the *Application Introduction* brief (navbar and app
background, light + dark) are also registered here, ready for a later assignment.

`src/index.css` pulls in Tailwind and the Martel Sans font:

```css
@import url("https://fonts.googleapis.com/css2?family=Martel+Sans:...");
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Step 3: Folder structure

The brief recommends a folder per concern:

```
src/
  api/         auth.js          mock sign-in / sign-up (no backend yet)
  components/  AuthLayout.jsx   shared split-panel shell
               ProtectedRoute.jsx
  pages/       SignIn.jsx, SignUp.jsx, Home.jsx
  redux/       store.js, authSlice.js
  schemas/     signupSchema.js  (zod)
  App.jsx      the routes
  main.jsx     app entry point
```

---

## Step 4: The Redux auth store (Task 4)

Redux Toolkit holds the authentication state so **any** component can read it.

`src/redux/authSlice.js` defines the state shape and how it changes:

```js
const initialState = { isAuthenticated: false, user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});
```

`src/redux/store.js` wires the slice into a store:

```js
export const store = configureStore({ reducer: { auth: authReducer } });
```

`src/main.jsx` makes the store (and the router) available to the whole app:

```jsx
<Provider store={store}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Provider>
```

---

## Step 5: Routing (Task 3) and ProtectedRoute (Task 5)

`src/App.jsx` maps URLs to pages:

```jsx
<Routes>
  <Route path="/signin" element={<SignIn />} />
  <Route path="/signup" element={<SignUp />} />

  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Home />} />
  </Route>

  <Route path="*" element={<Navigate to="/signin" replace />} />
</Routes>
```

`ProtectedRoute` reads the Redux flag and either renders the nested route or
bounces the visitor to sign-in:

```jsx
export default function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return <Outlet />;
}
```

Because everything is one app, the links between the two auth pages use
`<Link to="/signup">` instead of `<a href>` — navigation happens instantly with
no full page reload.

---

## Step 6: The page UIs (Tasks 1 & 2)

Both pages share the navy-panel + white-card layout, so it lives in one
component, `AuthLayout.jsx`, and each page just drops its form inside it:

```jsx
<AuthLayout>
  <h2 className="mb-8 text-2xl text-purple">Join Coders Now!</h2>
  <form onSubmit={...}>{/* inputs */}</form>
</AuthLayout>
```

The Tailwind classes are the same ones from the original HTML — only the wrapper
moved into a reusable component.

---

## Step 7: Form validation (Task 6)

The brief asks for **two different** validation techniques.

### Sign-in — plain React state

Field values and errors live in `useState`; we validate on submit:

```jsx
const [values, setValues] = useState({ email: "", password: "" });
const [errors, setErrors] = useState({});

const validate = () => {
  const next = {};
  if (!values.email) next.email = "Email is required";
  else if (!emailPattern.test(values.email)) next.email = "Enter a valid email";
  if (!values.password) next.password = "Password is required";
  return next;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const next = validate();
  setErrors(next);
  if (Object.keys(next).length) return;      // stop if invalid
  dispatch(login(await signIn(values)));      // success → Redux → redirect
  navigate("/");
};
```

Each input shows its message when present:

```jsx
{errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
```

### Sign-up — react-hook-form + zod

The rules live in a zod schema (`src/schemas/signupSchema.js`):

```js
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

`react-hook-form` registers the inputs and runs the schema through `zodResolver`:

```jsx
const { register, handleSubmit, formState: { errors } } =
  useForm({ resolver: zodResolver(signupSchema) });

<input placeholder="Email" {...register("email")} />
{errors.email && <span>{errors.email.message}</span>}

<form onSubmit={handleSubmit(onSubmit)}> ... </form>
```

`handleSubmit` only calls `onSubmit` when every field passes the schema; there
`onSubmit` dispatches `login` and navigates home — the same success path as
sign-in.

---

## Trying it out

```bash
npm run dev
```

1. Open `/` while logged out → you are redirected to `/signin` (the guard works).
2. Submit sign-in with a bad email or empty password → inline errors, no
   navigation.
3. Submit valid details → you land on the protected home page.
4. Click **Log out** → `logout` clears the store and you are sent back to
   `/signin`.
5. On `/signup`, submit an invalid form → each field shows its zod message; a
   valid form signs you in.

---

## What's next

The Redux store, protected routing, and folder structure are now in place for the
rest of the Coders app: the challenges home page, coding-lab, leaderboard, and
profile pages — plus the light/dark theme toggle whose colours are already
registered in `tailwind.config.js`.
