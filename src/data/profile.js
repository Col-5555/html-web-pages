// Dummy profile data (real data comes from the backend later). The read-only
// email is filled from the signed-in user at render time, not from here.
export const profile = {
  first_name: "Omar",
  last_name: "Moukhfi",
  bio: "",
  rank: 12,
  avatar_url: "", // empty → the form shows a neutral grey circle until uploaded
};

// Completed challenges per difficulty. The frontend computes the percentage from
// solved / total (e.g. 30 / 50 = 60%).
export const completedChallenges = {
  easy: { solved: 30, total: 50 },
  moderate: { solved: 10, total: 50 },
  hard: { solved: 1, total: 50 },
};

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

// Build one entry per day from the start date. Counts follow a fixed pattern
// (with some empty days) so the grid shows varied colours without a backend.
const COUNT_BUCKETS = [1, 2, 4, 10, 20, 30];

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export const heatmapValue = (() => {
  const value = [];
  for (let i = 0; i < 371; i++) {
    const date = new Date(heatmapStartDate);
    date.setDate(heatmapStartDate.getDate() + i);
    // Every 11th day is empty; otherwise cycle through the buckets.
    const count = i % 11 === 0 ? 0 : COUNT_BUCKETS[(i * 3) % COUNT_BUCKETS.length];
    value.push({ date: formatDate(date), count });
  }
  return value;
})();
