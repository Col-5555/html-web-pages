import { useState } from "react";
import Navbar from "../components/Navbar";
import CategoriesList from "../components/CategoriesList";
import ChallengesList from "../components/ChallengesList";
import TrendingCategoriesBox from "../components/TrendingCategoriesBox";
import TopKCodersList from "../components/TopKCodersList";
import { challenges } from "../data/challenges";

// The home / challenges page — the index screen of the app. Lays out the
// navbar, the challenges table (with category filter) in the main column, and
// the trending categories + top coders in a right-hand sidebar.
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // "All" shows everything; otherwise filter by the challenge's category.
  const visibleChallenges =
    selectedCategory === "All"
      ? challenges
      : challenges.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-appbg-light font-martel text-black dark:bg-appbg-dark dark:text-white">
      <Navbar />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:flex-row">
        {/* Main column: challenges */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold">Challenges</h1>
          <p className="mb-3 mt-4 text-sm text-muted">Select category</p>
          <div className="mb-4">
            <CategoriesList
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <ChallengesList challenges={visibleChallenges} />
        </main>

        {/* Sidebar: trending categories + top coders */}
        <aside className="flex w-full flex-col gap-6 lg:w-80">
          <TrendingCategoriesBox />
          <TopKCodersList />
        </aside>
      </div>
    </div>
  );
}
