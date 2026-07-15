import Navbar from "../components/Navbar";
import { leaderboard } from "../data/leaderboard";

// The leaderboard page: a table of the top coders by rank. Reached at
// /leaderboard (already routed in App.jsx). Styled like the challenges table,
// so it follows the app's light/dark theme.
export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-5xl p-6">
        <h1 className="mb-4 text-3xl font-bold">Leaderboard</h1>

        <div className="max-h-[70vh] overflow-auto rounded-lg bg-white shadow dark:bg-navy/60">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead className="sticky top-0 bg-white text-muted dark:bg-navy">
              <tr>
                <th className="p-3 text-left font-medium">Rank</th>
                <th className="p-3 text-left font-medium">Name</th>
                <th className="p-3 text-left font-medium">Score</th>
                <th className="p-3 text-left font-medium">Solved Challenges</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((coder) => (
                <tr
                  key={coder.rank}
                  className="border-t border-black/5 dark:border-white/10"
                >
                  <td className="p-3">{coder.rank}</td>
                  <td className="p-3">
                    {coder.first_name} {coder.last_name}
                  </td>
                  <td className="p-3">{coder.score}</td>
                  <td className="p-3">{coder.solved_challenges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
