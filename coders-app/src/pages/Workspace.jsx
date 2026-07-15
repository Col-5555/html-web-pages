import { useParams } from "react-router-dom";
import Split from "react-split";
import Navbar from "../components/Navbar";
import ChallengeDescription from "../components/ChallengeDescription";
import Playground from "../components/Playground";
import { challenges } from "../data/challenges";

// The workspace (coding lab) page, reached at /workspace/:challengeId. The route
// param is used to look up the challenge. The screen is split horizontally into
// the challenge description (left) and the playground (right).
export default function Workspace() {
  const { challengeId } = useParams();
  const challenge = challenges.find((c) => String(c.id) === challengeId);

  return (
    <div className="flex h-screen flex-col bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />

      {challenge ? (
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
      ) : (
        <main className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Challenge not found</h1>
          <p className="text-muted">
            No challenge exists for id &ldquo;{challengeId}&rdquo;.
          </p>
        </main>
      )}
    </div>
  );
}
