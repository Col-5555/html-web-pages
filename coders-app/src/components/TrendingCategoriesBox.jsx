import { trendingCategories } from "../data/trendingCategories";

// Lists the most-submitted categories. Each pill shows the category name and a
// badge with the number of challenges submitted in it.
export default function TrendingCategoriesBox() {
  return (
    <section className="rounded-lg bg-white p-4 shadow dark:bg-navy/60">
      <h2 className="mb-3 text-center text-lg font-bold">Trending Categories</h2>
      <div className="flex flex-wrap gap-2">
        {trendingCategories.map(({ category, count }) => (
          <span
            key={category}
            className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10"
          >
            {category}
            <span className="rounded-full bg-skyblue px-2 text-xs font-semibold text-white">
              {count}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
