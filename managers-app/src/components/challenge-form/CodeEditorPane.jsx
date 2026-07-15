"use client";

import { useSelector } from "react-redux";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import LanguageMenu from "./LanguageMenu";
import FontSizeMenu from "./FontSizeMenu";

// The starter-code editor (right pane). Same approach as the coders app:
// CodeMirror with the language + font size read from the Redux `workspace`
// slice, driven by the Language / FontSize dropdown menus above it. `value` and
// `onChange` are wired to react-hook-form via a Controller in ChallengeForm.
export default function CodeEditorPane({ value, onChange }) {
  const { language, fontSize } = useSelector((state) => state.workspace);

  const languageExtension = language === "python" ? python() : javascript();
  const fontSizeExtension = EditorView.theme({
    "&": { fontSize: `${fontSize}px` },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-end gap-2 border-b bg-muted/40 p-2">
        <FontSizeMenu />
        <LanguageMenu />
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[languageExtension, fontSizeExtension]}
        minHeight="240px"
        placeholder="Write the starter code for this challenge…"
      />
    </div>
  );
}
