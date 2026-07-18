import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import DropDown from "./DropDown";
import { setLanguage, setFontSize, setCode } from "../redux/workspaceSlice";

// The editor's language values ("javascript"/"python") map to the backend's
// language keys ("js"/"py") used for the starter code and submissions.
const API_LANG = { javascript: "js", python: "py" };

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
];

const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20].map((size) => ({
  value: size,
  label: String(size),
}));

// The top half of the Playground: a config row (language + font size) plus the
// CodeMirror editor. Language and font size live in the Redux `workspace` slice;
// the editor's syntax highlighting and theme follow the app's language + theme.
export default function CodeEditor({ starterCode = {} }) {
  const { language, fontSize, code } = useSelector((state) => state.workspace);
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  // Seed the editor with the challenge's starter code for the current language.
  // Re-runs when the challenge (its starterCode) or the language changes, so
  // switching language loads that language's starter.
  useEffect(() => {
    dispatch(setCode(starterCode[API_LANG[language]] ?? ""));
  }, [dispatch, starterCode, language]);

  // Syntax highlighting for the chosen language, plus a theme extension that
  // applies the chosen font size to the editor.
  const languageExtension = language === "python" ? python() : javascript();
  const fontSizeExtension = EditorView.theme({
    "&": { fontSize: `${fontSize}px` },
  });

  return (
    <div className="flex h-full flex-col bg-white dark:bg-navy/40">
      {/* Config row */}
      <div className="flex items-center justify-end gap-3 border-b border-black/10 p-2 dark:border-white/10">
        <DropDown
          value={fontSize}
          options={FONT_SIZE_OPTIONS}
          onChange={(value) => dispatch(setFontSize(value))}
        />
        <DropDown
          value={language}
          options={LANGUAGE_OPTIONS}
          onChange={(value) => dispatch(setLanguage(value))}
        />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={code}
          onChange={(value) => dispatch(setCode(value))}
          theme={mode === "dark" ? "dark" : "light"}
          extensions={[languageExtension, fontSizeExtension]}
          height="100%"
        />
      </div>
    </div>
  );
}
