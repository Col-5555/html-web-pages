import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import themeReducer from "./themeSlice";
import workspaceReducer from "./workspaceSlice";

// The single Redux store for the application. New feature slices (challenges,
// leaderboard, profile, ...) will be added to the `reducer` map in later
// assignments.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    workspace: workspaceReducer,
  },
});
