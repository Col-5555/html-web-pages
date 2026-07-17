import { createSlice } from "@reduxjs/toolkit";

// Authentication state for the managers app. `login` records the signed-in
// manager and their JWT (also mirrored in a cookie for server-side API calls);
// `isAuthenticated` guards the dashboard.
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // payload: { user, token }
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user ?? null;
      state.token = action.payload.token ?? null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
