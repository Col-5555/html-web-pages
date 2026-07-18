import { useParams } from "react-router-dom";
import Split from "react-split";
import Navbar from "../components/Navbar";
import ChallengeDescription from "../components/ChallengeDescription";
import Playground from "../components/Playground";
import { useGetChallengeQuery } from "../redux/api";

// The workspace (coding lab) page, reached at /workspace/:challengeId. The route
// param drives a fetch of the full challenge (description, starter code, tests).
// The screen is split horizontally into the challenge description (left) and the
// playground (right).
export default function Workspace() {
  const { challengeId } = useParams();
  const {
    data: challenge,
    isLoading,
    isError,
  } = useGetChallengeQuery(challengeId);

  return (
    <div className="flex h-screen flex-col bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />

      {isLoading ? (
        <main className="flex flex-1 items-center justify-center text-muted">
          Loading challenge…
        </main>
      ) : isError || !challenge ? (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Challenge not found</h1>
          <p className="text-muted">
            No challenge exists for id &ldquo;{challengeId}&rdquo;.
          </p>
        </main>
      ) : (
        <Split
          className="split-horizontal min-h-0 flex-1"
          direction="horizontal"
          sizes={[45, 55]}
          minSize={280}
          gutterSize={8}
        >
          <ChallengeDescription challenge={challenge} />
          <Playground challenge={challenge} />
        </Split>
      )}
    </div>
  );
}
