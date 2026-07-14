import Navbar from "../components/Navbar";

// Placeholder for the Profile page — built in a later assignment. Exists now so
// the avatar dropdown's Profile link doesn't dead-end.
export default function Profile() {
  return (
    <div className="min-h-screen bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />
      <main className="flex flex-col items-center justify-center gap-2 p-16 text-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted">Coming soon.</p>
      </main>
    </div>
  );
}
