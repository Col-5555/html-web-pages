import { useSelector } from "react-redux";
import MarkdownPreview from "@uiw/react-markdown-preview";
import DifficultyBadge from "./DifficultyBadge";
import StatusIcon from "./StatusIcon";

// The left half of the workspace: the challenge's title, difficulty, and status,
// followed by its markdown description. `@uiw/react-markdown-preview` renders the
// markdown; wrapping it in `data-color-mode={mode}` makes it follow the app's
// light/dark theme.
export default function ChallengeDescription({ challenge }) {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <div className="h-full overflow-auto bg-white p-6 dark:bg-navy/40">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">{challenge.title}</h1>
        <DifficultyBadge difficulty={challenge.difficulty} />
        <StatusIcon status={challenge.status} />
      </div>

      <div data-color-mode={mode}>
        <MarkdownPreview
          source={challenge.description}
          style={{ background: "transparent" }}
        />
      </div>
    </div>
  );
}
