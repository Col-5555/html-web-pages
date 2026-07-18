import Category from "./Category";

// Renders the category filter pills: an "All" pill plus one Category per entry
// in the `categories` list (fetched from the backend and passed by the parent).
// The currently selected value and the setter come from the parent (Home),
// which uses them to filter the challenges table.
export default function CategoriesList({ categories = [], selected, onSelect }) {
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
