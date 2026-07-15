"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";

// SimpleMDE touches the DOM on load, so it can't be server-rendered. next/dynamic
// with `ssr: false` (only allowed inside a Client Component) loads it on the
// client only. `value` / `onChange` are wired to react-hook-form via a
// Controller in ChallengeForm.
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-md border p-3 text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export default function MarkdownField({ value, onChange }) {
  // Memoised so the editor isn't re-instantiated (and the cursor reset) on every
  // keystroke re-render.
  const options = useMemo(
    () => ({
      spellChecker: false,
      status: false,
      placeholder: "Describe the challenge in markdown…",
    }),
    []
  );

  return <SimpleMDE value={value} onChange={onChange} options={options} />;
}
