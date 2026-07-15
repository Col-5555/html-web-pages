import CoderCard from "./CoderCard";
import { topCoders } from "../data/topCoders";

// Shows the "Top 4 coders" cards. Data is already ordered by score, so the
// array index + 1 is the coder's rank.
export default function TopKCodersList() {
  return (
    <section className="rounded-lg bg-white p-4 shadow dark:bg-navy/60">
      <h2 className="mb-3 text-center text-lg font-bold">Top 4 coders</h2>
      <div>
        {topCoders.map((coder, index) => (
          <CoderCard key={coder.id} coder={coder} rank={index + 1} />
        ))}
      </div>
    </section>
  );
}
