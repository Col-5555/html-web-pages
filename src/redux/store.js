import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// The single Redux store for the application. New feature slices (challenges,
// leaderboard, profile, ...) will be added to the `reducer` map in later
// assignments.
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
