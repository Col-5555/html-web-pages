import { createSlice } from "@reduxjs/toolkit";

// Theme state (light / dark) lives in Redux so any component can read it and
// the Navbar toggle can flip it. The initial value is restored from
// localStorage so the coder's last choice survives a page reload (the brief's
// optional persistence task).
const initialState = {
  mode: localStorage.getItem("theme") || "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.mode);
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
