import { createSlice } from "@reduxjs/toolkit";

// Editor configuration for the workspace (coding lab): which language the code
// editor highlights and its font size. Kept in Redux so the config dropdowns and
// the editor stay in sync (and so later features can read the choice too).
const initialState = {
  language: "javascript", // "javascript" | "python"
  fontSize: 16,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
  },
});

export const { setLanguage, setFontSize } = workspaceSlice.actions;
export default workspaceSlice.reducer;
