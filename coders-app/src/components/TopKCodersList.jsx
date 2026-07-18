import CoderCard from "./CoderCard";
import { useGetTopCodersQuery } from "../redux/api";

// Shows the "Top 4 coders" cards. The backend returns them ordered by score, so
// the array index + 1 is the coder's rank.
export default function TopKCodersList() {
  const { data: topCoders = [] } = useGetTopCodersQuery(4);

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
