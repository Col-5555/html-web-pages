"use client";

import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { login } from "@/redux/authSlice";

// Client-side providers wrapper. In the App Router the root layout is a Server
// Component, so context (the Redux store) must live in a Client Component.

// Rehydrate auth from the token cookie on the client, once at module load — before
// anything renders — so a page refresh keeps the manager signed in (Redux state
// isn't otherwise persisted). The signin route handler set this cookie; here we
// decode the JWT to recover the manager's identity.
function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

if (typeof window !== "undefined" && !store.getState().auth.isAuthenticated) {
  const token = readCookie("token");
  const payload = token && decodeJwt(token);
  if (payload) {
    store.dispatch(
      login({
        token,
        user: { id: payload.id, email: payload.email, role: payload.role },
      }),
    );
  }
}

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}
