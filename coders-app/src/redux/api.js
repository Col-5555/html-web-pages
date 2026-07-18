import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./authSlice";

// The backend and the UI disagree on a few field names/shapes; we reconcile them
// here (in transformResponse) so the components keep consuming their original
// shape. For the challenges table the UI needs
// { id, title, category, difficulty, status, solutionRate }.
//
// - _id            -> id
// - solution_rate  -> solutionRate as a "NN%" string
// - status         -> the backend's "Waiting" is the UI's "Pending"
//   (Attempted / Completed are already the UI's values)
const STATUS_MAP = { Waiting: "Pending" };

function mapChallengeSummary(c) {
  return {
    id: c._id,
    title: c.title,
    category: c.category,
    difficulty: c.difficulty,
    status: STATUS_MAP[c.status] ?? c.status,
    solutionRate: `${c.solution_rate ?? 0}%`,
  };
}

// The workspace needs the full challenge: the summary fields plus the markdown
// description, the per-language starter code, and the test cases. The backend's
// shapes differ from what the editor/test panel expect, so we reshape here:
//
// - code.code_text [{ language:"js"|"py", content }] -> starterCode { js, py }
// - tests [{ inputs:[{name,value}], expected_output }] -> [{ id, inputText, outputText }]
//   inputText  = the input values joined (e.g. "[2,7,11,15], 9")
//   outputText = the expected output as JSON (e.g. "[0,1]")
function mapChallengeDetail(c) {
  const starterCode = (c.code?.code_text ?? []).reduce((acc, entry) => {
    acc[entry.language] = entry.content;
    return acc;
  }, {});

  const tests = (c.tests ?? []).map((test, index) => ({
    id: index,
    inputText: test.inputs.map((input) => JSON.stringify(input.value)).join(", "),
    outputText: JSON.stringify(test.expected_output),
  }));

  return {
    ...mapChallengeSummary(c),
    description: c.description,
    functionName: c.code?.function_name,
    starterCode,
    tests,
  };
}

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

    // List challenges, optionally filtered by category (omit for "All"). The
    // backend returns each coder's per-challenge status alongside the data.
    getChallenges: builder.query({
      query: (category) =>
        category
          ? `/challenges?category=${encodeURIComponent(category)}`
          : "/challenges",
      transformResponse: (challenges) => challenges.map(mapChallengeSummary),
      providesTags: ["Challenge"],
    }),

    // The distinct categories in use — a plain array of strings, used for the
    // filter pills. No mapping needed.
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Challenge"],
    }),

    // One challenge with everything the workspace needs (description, starter
    // code, tests).
    getChallenge: builder.query({
      query: (id) => `/challenges/${id}`,
      transformResponse: mapChallengeDetail,
      providesTags: (result, error, id) => [{ type: "Challenge", id }],
    }),

    // Submit code for grading. Body: { lang: "js"|"py", code, challenge_id }.
    // Returns { passed, score, status, message, test_results }. A passing
    // submission changes the challenge's status, so invalidate the cache to
    // refresh the list + this challenge.
    submit: builder.mutation({
      query: (body) => ({
        url: "/submissions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Challenge"],
    }),

    // A coder's own profile (owner-only on the backend). Returns the user in
    // snake_case plus a computed `rank`. No mapping needed — the form reads the
    // backend fields directly.
    getProfile: builder.query({
      query: (id) => `/coders/${id}/profile`,
      providesTags: (result, error, id) => [{ type: "Profile", id }],
    }),

    // Update the profile. Body is FormData (an optional `avatar` file + the text
    // fields first_name / last_name / about), so we DON'T set a JSON content-type
    // — fetchBaseQuery lets the browser set the multipart boundary. Returns
    // { message, profile }. Invalidate Profile so the view refetches.
    updateProfile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/coders/${id}/profile`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Profile", id }],
    }),

    // Solved-challenges stats for the logged-in coder. Mapped to the
    // CompletedChallenges shape { easy|moderate|hard: { solved, total } }.
    getSolvedChallenges: builder.query({
      query: () => "/stats/solved-challenges",
      transformResponse: (s) => ({
        easy: {
          solved: s.totalEasySolvedChallenges,
          total: s.totalEasyChallenges,
        },
        moderate: {
          solved: s.totalModerateSolvedChallenges,
          total: s.totalModerateChallenges,
        },
        hard: {
          solved: s.totalHardSolvedChallenges,
          total: s.totalHardChallenges,
        },
      }),
      providesTags: ["Stats"],
    }),

    // The coding-strikes heatmap: [{ date: "YYYY/MM/DD", count }] — already the
    // shape @uiw/react-heat-map expects, so no mapping needed.
    getHeatmap: builder.query({
      query: () => "/stats/heatmap",
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetChallengesQuery,
  useGetCategoriesQuery,
  useGetChallengeQuery,
  useSubmitMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetSolvedChallengesQuery,
  useGetHeatmapQuery,
} = api;
