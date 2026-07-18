import { useGetSolvedChallengesQuery } from "../redux/api";

// One progress bar for a difficulty. The percentage is computed on the frontend
// from solved / total (the backend will send those two numbers later).
function Bar({ label, color, solved, total }) {
  const percent = total ? Math.round((solved / total) * 100) : 0;

  return (
    <div>
      <p className="text-center text-sm">{label}:</p>
      <div
        className="relative h-5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"
        title={`${solved} / ${total}`}
      >
        <div
          className={`flex h-full items-center justify-center rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        >
          {percent >= 12 && (
            <span className="text-xs font-medium text-white">{percent}%</span>
          )}
        </div>
      </div>
    </div>
  );
}

const EMPTY = { solved: 0, total: 0 };

// The "Completed challenges" statistics panel: Easy / Moderate / Hard bars.
export default function CompletedChallenges() {
  const { data } = useGetSolvedChallengesQuery();
  const { easy = EMPTY, moderate = EMPTY, hard = EMPTY } = data ?? {};

  return (
    <section className="rounded-lg bg-white p-4 shadow dark:bg-navy/60">
      <h2 className="mb-3 text-center text-lg font-bold">Completed challenges</h2>
      <div className="space-y-2">
        <Bar label="Easy" color="bg-green-500" {...easy} />
        <Bar label="Moderate" color="bg-amber-400" {...moderate} />
        <Bar label="Hard" color="bg-red-500" {...hard} />
      </div>
    </section>
  );
}
