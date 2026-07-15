import AuthGuard from "@/components/AuthGuard";
import Navbar from "@/components/Navbar";
import ChallengesList from "@/components/ChallengesList";
import { getChallenges } from "@/lib/api/challenges";

// The dashboard home. A Server Component: it fetches the challenges from the
// mock API and renders the navbar + table. The AuthGuard (a Client Component)
// wraps the content and redirects unauthenticated managers to /signin.
export default async function Home() {
  const challenges = await getChallenges();

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto w-full max-w-5xl p-6">
        <ChallengesList challenges={challenges} />
      </main>
    </AuthGuard>
  );
}
