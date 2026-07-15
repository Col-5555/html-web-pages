// A single category pill. Highlighted when it is the selected filter.
export default function Category({ label, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      className={`rounded-full px-4 py-1 text-sm transition ${
        isSelected
          ? "bg-purple text-white"
          : "bg-white text-navy hover:bg-black/5 dark:bg-navy dark:text-white dark:hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
