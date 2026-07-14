import { createSlice } from "@reduxjs/toolkit";

// The authentication state used across the whole application.
// There is no real backend yet, so `login` simply records the coder that
// "signed in" and flips the `isAuthenticated` flag that ProtectedRoute checks.
const initialState = {
  isAuthenticated: false,
  user: null,
};

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

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
