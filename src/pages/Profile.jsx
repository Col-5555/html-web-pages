import Navbar from "../components/Navbar";
import ProfileForm from "../components/ProfileForm";
import CompletedChallenges from "../components/CompletedChallenges";
import CodingStrikes from "../components/CodingStrikes";

// The profile page: the coder's editable details (left) and their performance
// statistics (right). Reached at /profile (already routed). Stacks vertically on
// small screens and follows the light/dark theme.
export default function Profile() {
  return (
    <div className="min-h-screen bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:flex-row">
        {/* Left: profile form */}
        <main className="flex-1">
          <ProfileForm />
        </main>

        {/* Right: statistics */}
        <aside className="flex w-full flex-col gap-6 lg:w-[400px]">
          <CompletedChallenges />
          <CodingStrikes />
        </aside>
      </div>
    </div>
  );
}
