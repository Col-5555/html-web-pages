// Static helpers for the coding-strikes heatmap. The daily counts now come from
// the backend (GET /stats/heatmap); only the panel colours and the heatmap's
// start date are defined on the frontend.

// Heatmap panel colours for each theme (verbatim from the brief). Keys are count
// thresholds; @uiw/react-heat-map picks the colour for the highest threshold a
// cell's count reaches.
export const panelColors = {
  dark: {
    0: "#fadfc3",
    2: "#fcca95",
    4: "#fcbc77",
    10: "#ffaf59",
    20: "#fc9b32",
    30: "#fa5902",
  },
  light: {
    0: "#b89ffc",
    2: "#916afc",
    4: "#7e52f7",
    10: "#6f3cfa",
    20: "#5a1fff",
    30: "#2f03ad",
  },
};

// The heatmap covers roughly the last year. Start one year ago (midnight).
export const heatmapStartDate = (() => {
  const start = new Date();
  start.setFullYear(start.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return start;
})();
