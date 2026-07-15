import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// The Redux store for the managers app. The workspace slice (editor language /
// font size) is added in the challenge-form phase.
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
