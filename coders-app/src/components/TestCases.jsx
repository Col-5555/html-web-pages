import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSubmitMutation } from "../redux/api";
import { setResult } from "../redux/workspaceSlice";

// The editor language values map to the backend's language codes.
const API_LANG = { javascript: "js", python: "py" };

// The bottom half of the Playground: a tab per test case, the selected case's
// input + expected output, a Submit button, and — after submitting — the grader's
// result. Submit posts the code (lifted into the workspace slice) to the backend,
// which runs it against the challenge's tests via an external code runner.
export default function TestCases({ tests = [], challengeId }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { code, language, result } = useSelector((state) => state.workspace);
  const [submit, { isLoading }] = useSubmitMutation();

  const activeTest = tests[activeIndex];

  // Reset the panel when switching to a different challenge (the component stays
  // mounted across /workspace/:id changes).
  useEffect(() => {
    setActiveIndex(0);
    setError("");
    dispatch(setResult(null));
  }, [challengeId, dispatch]);

  const handleSubmit = async () => {
    setError("");
    dispatch(setResult(null));
    try {
      const res = await submit({
        lang: API_LANG[language],
        code,
        challenge_id: challengeId,
      }).unwrap();
      dispatch(setResult(res));
    } catch (err) {
      // e.g. 409 already solved, 502/504 runner unavailable/timeout.
      setError(err?.data?.message ?? "Submission failed. Please try again.");
    }
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

      {/* Result / errors */}
      {isLoading && (
        <p className="mt-4 text-sm text-muted">
          Running your code… the grader can take up to a minute on a cold start.
        </p>
      )}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {result && !isLoading && (
        <div className="mt-4 space-y-2 text-sm">
          <div
            className={`rounded px-3 py-2 font-semibold ${
              result.passed
                ? "bg-green-500/15 text-green-600 dark:text-green-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400"
            }`}
          >
            {result.passed ? "✓ Passed" : "✗ Failed"} — score {result.score}
          </div>
          {result.message && (
            <p className="text-muted">{result.message}</p>
          )}
          {Array.isArray(result.test_results) &&
            result.test_results.length > 0 && (
              <ul className="space-y-1">
                {result.test_results.map((tr, index) => (
                  <li
                    key={tr.test_id ?? index}
                    className="flex items-center justify-between rounded bg-black/5 px-3 py-2 text-xs dark:bg-white/10"
                  >
                    <span>Test {index + 1}</span>
                    <span
                      className={
                        tr.status === "passed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {tr.status ?? "—"}
                      {tr.message ? ` · ${tr.message}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {/* Submit */}
      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="rounded bg-skyblue px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
        >
          {isLoading ? "Running…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
