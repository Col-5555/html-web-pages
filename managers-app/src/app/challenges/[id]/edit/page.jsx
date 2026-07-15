import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ChallengeForm from "@/components/challenge-form/ChallengeForm";
import { getChallenge } from "@/lib/api/challenges";

// Edit-challenge route. A Server Component: it fetches the challenge by id and
// hands it to the shared ChallengeForm (which PUTs via the updateChallenge
// Server Action). In Next 16 the dynamic `params` is a Promise, so we await it.
export default async function EditChallengePage({ params }) {
  const { id } = await params;
  const challenge = await getChallenge(id);

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-6">
        {challenge ? (
          <>
            <h1 className="mb-6 text-xl font-semibold">
              Edit: {challenge.title}
            </h1>
            <ChallengeForm challenge={challenge} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <h1 className="text-2xl font-bold">Challenge not found</h1>
            <p className="text-muted-foreground">
              No challenge exists for id “{id}”.
            </p>
            <Link href="/" className="mt-2 font-medium text-primary">
              Back to challenges
            </Link>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
