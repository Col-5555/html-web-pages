import { useState } from "react";
import { FaTrophy, FaMedal } from "react-icons/fa6";

// Icon indicating a coder's rank: gold trophy for 1st, silver/bronze medals for
// 2nd/3rd, and a plain "#n" badge otherwise.
function RankIcon({ rank }) {
  if (rank === 1) return <FaTrophy className="text-yellow-400" title="1st" />;
  if (rank === 2) return <FaMedal className="text-gray-400" title="2nd" />;
  if (rank === 3) return <FaMedal className="text-amber-700" title="3rd" />;
  return <span className="text-xs font-semibold text-muted">#{rank}</span>;
}

// A single coder row: avatar (or initials fallback), rank icon, full name, and
// score.
export default function CoderCard({ coder, rank }) {
  const { first_name, last_name, avatar_url, score } = coder;
  const [imgFailed, setImgFailed] = useState(false);
  const initials = `${first_name[0] ?? ""}${last_name[0] ?? ""}`;
  const showAvatar = avatar_url && !imgFailed;

  return (
    <div className="flex items-center gap-3 border-b border-black/5 py-2 last:border-b-0 dark:border-white/10">
      {showAvatar ? (
        <img
          src={avatar_url}
          alt={`${first_name} ${last_name}`}
          onError={() => setImgFailed(true)}
          className="h-9 w-9 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-purple text-xs font-semibold text-white">
          {initials}
        </span>
      )}

      <span className="w-4 shrink-0 text-center">
        <RankIcon rank={rank} />
      </span>

      <span className="flex-1 truncate">
        {first_name} {last_name}
      </span>

      <span className="text-sm text-muted">Score: {score}</span>
    </div>
  );
}
