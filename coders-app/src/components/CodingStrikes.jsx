import { useSelector } from "react-redux";
import HeatMap from "@uiw/react-heat-map";
import {
  heatmapValue,
  heatmapStartDate,
  panelColors,
} from "../data/profile";

// The "Your coding strikes" panel: a GitHub-style heatmap of accepted
// submissions over the last year. Colours come from the brief's panelColors and
// follow the app theme. Each cell gets an SVG <title> for a hover tooltip.
export default function CodingStrikes() {
  const mode = useSelector((state) => state.theme.mode);

  return (
    <section className="rounded-lg bg-white p-4 shadow dark:bg-navy/60">
      <h2 className="mb-3 text-center text-lg font-bold">Your coding strikes</h2>
      <div className="coding-strikes overflow-x-auto text-navy dark:text-white">
        <HeatMap
          value={heatmapValue}
          startDate={heatmapStartDate}
          width={720}
          rectSize={11}
          legendCellSize={0}
          panelColors={panelColors[mode]}
          rectRender={(props, data) => (
            <rect {...props}>
              <title>{`${data.count || 0} correct submissions`}</title>
            </rect>
          )}
        />
      </div>
    </section>
  );
}
