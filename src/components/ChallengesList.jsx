import StatusIcon from "./StatusIcon";
import DifficultyBadge from "./DifficultyBadge";

// The challenges table. `challenges` is passed in already filtered by the
// selected category. The outer div is a scroll container so a long list doesn't
// overflow the page (both axes).
export default function ChallengesList({ challenges }) {
  return (
    <div className="max-h-[60vh] overflow-auto rounded-lg bg-white shadow dark:bg-navy/60">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead className="sticky top-0 bg-white text-muted dark:bg-navy">
          <tr>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-left font-medium">Title</th>
            <th className="p-3 text-left font-medium">Category</th>
            <th className="p-3 text-left font-medium">Difficulty</th>
            <th className="p-3 text-left font-medium">Solution Rate</th>
          </tr>
        </thead>
        <tbody>
          {challenges.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted">
                No challenges in this category yet.
              </td>
            </tr>
          ) : (
            challenges.map((challenge) => (
              <tr
                key={challenge.id}
                className="border-t border-black/5 dark:border-white/10"
              >
                <td className="p-3">
                  <StatusIcon status={challenge.status} />
                </td>
                <td className="p-3">{challenge.title}</td>
                <td className="p-3">{challenge.category}</td>
                <td className="p-3">
                  <DifficultyBadge difficulty={challenge.difficulty} />
                </td>
                <td className="p-3">{challenge.solutionRate}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
