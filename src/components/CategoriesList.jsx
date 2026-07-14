import Category from "./Category";
import { categories } from "../data/categories";

// Renders the category filter pills: an "All" pill plus one Category per entry
// in the categories data. The currently selected value and the setter come from
// the parent (Home), which uses them to filter the challenges table.
export default function CategoriesList({ selected, onSelect }) {
  const options = ["All", ...categories];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((label) => (
        <Category
          key={label}
          label={label}
          isSelected={selected === label}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
