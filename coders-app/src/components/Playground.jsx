import Split from "react-split";
import CodeEditor from "./CodeEditor";
import TestCases from "./TestCases";

// The right half of the workspace, itself split *vertically* into the code
// editor (top) and the test cases (bottom).
export default function Playground({ challenge }) {
  return (
    <Split
      className="split-vertical h-full"
      direction="vertical"
      sizes={[60, 40]}
      minSize={100}
      gutterSize={8}
    >
      <CodeEditor starterCode={challenge.starterCode} />
      <TestCases tests={challenge.tests} challengeId={challenge.id} />
    </Split>
  );
}
