import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import workspaceReducer from "./workspaceSlice";

// The Redux store for the managers app. `auth` guards the dashboard; `workspace`
// holds the challenge-form code editor's language + font size.
export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
  },
});
