import { createSlice } from "@reduxjs/toolkit";

// State for the workspace (coding lab): the editor config (language + font size),
// the code being written, and the latest grading result. Code lives here (rather
// than in CodeEditor's local state) so the Submit button in the TestCases panel
// can read exactly what the editor shows and post it to the grader.
const initialState = {
  language: "javascript", // "javascript" | "python"
  fontSize: 16,
  code: "", // seeded from the challenge's starter code for the current language
  result: null, // the grader's response: { passed, score, status, message, test_results }
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
    setCode: (state, action) => {
      state.code = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload;
    },
  },
});

export const { setLanguage, setFontSize, setCode, setResult } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
