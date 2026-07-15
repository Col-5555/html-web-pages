import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ChallengeForm from "@/components/challenge-form/ChallengeForm";

// Create-challenge route. The AuthGuard (client) protects it; the form (client)
// handles input and POSTs via the createChallenge Server Action.
export default function NewChallengePage() {
  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl p-6">
        <h1 className="mb-6 text-xl font-semibold">New challenge</h1>
        <ChallengeForm />
      </main>
    </AuthGuard>
  );
}
