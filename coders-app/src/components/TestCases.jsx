import { useState } from "react";

// The bottom half of the Playground: a tab per test case, the selected case's
// input + expected output, and a Submit button. The grading backend comes in a
// later assignment, so Submit just shows a mock confirmation for now.
export default function TestCases({ tests = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const activeTest = tests[activeIndex];

  const handleSubmit = () => {
    // Placeholder: later this posts the code to the grading service.
    setSubmitted(true);
  };

  return (
    <div className="flex h-full flex-col overflow-auto bg-white p-4 dark:bg-navy/40">
      <h2 className="mb-2 font-semibold">Testcases</h2>

      {/* Case tabs */}
      <div className="mb-3 flex gap-2">
        {tests.map((test, index) => (
          <button
            key={test.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`rounded px-3 py-1 text-sm ${
              index === activeIndex
                ? "bg-purple text-white"
                : "bg-black/5 dark:bg-white/10"
            }`}
          >
            Case {index + 1}
          </button>
        ))}
      </div>

      {/* Selected case details */}
      {activeTest && (
        <div className="space-y-3 text-sm">
          <div>
            <p className="mb-1 text-muted">Input:</p>
            <div className="rounded bg-black/5 px-3 py-2 font-mono dark:bg-white/10">
              {activeTest.inputText}
            </div>
          </div>
          <div>
            <p className="mb-1 text-muted">Expected output:</p>
            <div className="rounded bg-black/5 px-3 py-2 font-mono dark:bg-white/10">
              {activeTest.outputText}
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {submitted && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Submitted!
          </span>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded bg-skyblue px-4 py-1.5 text-sm font-semibold text-white"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
