// Mock leaderboard data. Real rankings come from the persistence layer later.
// `leaderboard` is the full ranked list; `topCoders` powers the top-k endpoint.
// Both reuse the coders-app sample shapes.
export const leaderboard = [
  { rank: 1, first_name: "John", last_name: "Doe", score: 400, solved_challenges: 150 },
  { rank: 2, first_name: "Alice", last_name: "Smith", score: 350, solved_challenges: 140 },
  { rank: 3, first_name: "Emma", last_name: "Johnson", score: 320, solved_challenges: 135 },
  { rank: 4, first_name: "Michael", last_name: "Brown", score: 270, solved_challenges: 120 },
  { rank: 5, first_name: "Emily", last_name: "Davis", score: 250, solved_challenges: 110 },
];

export const topCoders = [
  { id: 101, first_name: "Alice", last_name: "Johnson", avatar_url: "https://i.pravatar.cc/150?img=1", score: 350 },
  { id: 102, first_name: "Bob", last_name: "Smith", avatar_url: "https://i.pravatar.cc/150?img=2", score: 320 },
  { id: 103, first_name: "Emily", last_name: "Davis", avatar_url: "https://i.pravatar.cc/150?img=5", score: 290 },
  { id: 104, first_name: "Michael", last_name: "Brown", avatar_url: "https://i.pravatar.cc/150?img=4", score: 270 },
];
