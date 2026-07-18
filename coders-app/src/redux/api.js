import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

// The single RTK Query "API slice" for the whole app. Later assignments inject
// their endpoints (challenges, workspace, profile, leaderboard) into this same
// slice via api.injectEndpoints, so there is one cache, one middleware, and one
// place that attaches the auth token.

// fetchBaseQuery targets the backend's /api prefix and attaches the JWT (kept in
// the auth slice) as a Bearer token on every request.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${import.meta.env.VITE_API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrap the base query so an expired/invalid token (401) logs the user out
// everywhere, sending them back to the sign-in page. Used by every phase's
// authenticated endpoints.
const baseQuery = async (args, apiObj, extraOptions) => {
  const result = await rawBaseQuery(args, apiObj, extraOptions);
  if (result.error && result.error.status === 401) {
    apiObj.dispatch(logout());
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery,
  // Cache tags shared across phases; endpoints declare providesTags/invalidatesTags.
  tagTypes: ["Challenge", "Profile", "Leaderboard", "Stats"],
  endpoints: (builder) => ({
    // Log in a coder. Returns { token, user } on success; the caller stores both
    // in the auth slice. Backend errors: 401 bad creds, 403 unverified email.
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/coders/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // Register a coder. Returns { message, user, emailPreviewUrl } — no token, no
    // auto-login: the account must verify its email first.
    register: builder.mutation({
      query: (body) => ({
        url: "/auth/coders/register",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = api;
