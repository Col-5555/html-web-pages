import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "./api";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";
import workspaceReducer from "./workspaceSlice";

// Key under which the auth slice ({ isAuthenticated, user, token }) is persisted
// to localStorage so a signed-in session survives a page refresh.
const AUTH_KEY = "coders-app.auth";

// Read the persisted auth state (if any) to seed the store. Guards against
// missing/corrupt storage so a bad value can never crash start-up.
function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? { auth: JSON.parse(raw) } : undefined;
  } catch {
    return undefined;
  }
}

// The single Redux store for the application. Feature endpoints are injected into
// the RTK Query `api` slice (see ./api.js) rather than added here.
export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    theme: themeReducer,
    workspace: workspaceReducer,
  },
  preloadedState: loadAuth(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Enable refetchOnFocus / refetchOnReconnect behaviour for RTK Query.
setupListeners(store.dispatch);

// Persist the auth slice on every change so login/logout survive a refresh.
store.subscribe(() => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(store.getState().auth));
  } catch {
    // Ignore write failures (e.g. storage disabled / quota) — non-critical.
  }
});
