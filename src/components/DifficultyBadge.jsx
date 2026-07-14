// Coloured pill for a challenge's difficulty: Easy=green, Moderate=amber,
// Hard=red.
const DIFFICULTY_CLASSES = {
  Easy: "bg-green-500",
  Moderate: "bg-amber-400",
  Hard: "bg-red-500",
};

export default function DifficultyBadge({ difficulty }) {
  const color = DIFFICULTY_CLASSES[difficulty] ?? "bg-gray-400";

  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold text-white ${color}`}
    >
      {difficulty}
    </span>
  );
}
