import { createSlice } from "@reduxjs/toolkit";

// The authentication state used across the whole application. `token` is the JWT
// issued by the backend on login; it is the source of truth for route guards and
// is attached to every API request (see redux/api.js). The store hydrates this
// slice from localStorage, so a refresh keeps the user signed in.
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // payload: { user, token } from a successful login.
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    // Replace the stored user (e.g. after a profile update) without touching the
    // token — keeps the Navbar name/avatar in sync.
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
