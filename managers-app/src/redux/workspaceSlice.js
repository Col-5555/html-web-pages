import { createSlice } from "@reduxjs/toolkit";

// Editor configuration for the challenge form's code pane: which language the
// CodeMirror editor highlights and its font size. Kept in Redux (mirroring the
// coders app) so the LanguageMenu / FontSizeMenu dropdowns and the editor stay
// in sync. The chosen language is also saved onto the challenge's `code`.
const initialState = {
  language: "javascript", // "javascript" | "python"
  fontSize: 14,
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
