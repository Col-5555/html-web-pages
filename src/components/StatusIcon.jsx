import { BsCheck2Circle } from "react-icons/bs";
import { LuFileSpreadsheet } from "react-icons/lu";
import { FaRegHourglass } from "react-icons/fa6";

// Maps a challenge status to its icon, colour, and tooltip description
// (icons chosen by the brief).
const STATUS_CONFIG = {
  Completed: {
    Icon: BsCheck2Circle,
    className: "text-green-500",
    description: "Completed",
  },
  Attempted: {
    Icon: LuFileSpreadsheet,
    className: "text-blue-500",
    description: "Attempted",
  },
  Pending: {
    Icon: FaRegHourglass,
    className: "text-amber-500",
    description: "Pending",
  },
};

// Renders the status icon with a tooltip that appears on hover. The tooltip is
// pure Tailwind: the wrapper is a `group`, and the label uses `group-hover` to
// fade in — no tooltip library needed.
export default function StatusIcon({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const { Icon, className, description } = config;

  return (
    <span className="group relative inline-flex justify-center">
      <Icon className={`text-lg ${className}`} aria-label={status} />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        {description}
      </span>
    </span>
  );
}
