import { createSlice } from "@reduxjs/toolkit";

// Authentication state for the managers app. There is no real auth backend
// (json-server only stores challenges), so `login` just records the manager and
// flips the `isAuthenticated` flag used to guard the dashboard.
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
