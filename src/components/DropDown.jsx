import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

// A small reusable dropdown. Shows the selected option's label + a caret;
// clicking opens a list; picking an option calls `onChange(value)`; clicking
// outside closes it (same pattern as the Navbar profile menu).
//
// props:
//   value    - the currently selected value
//   options  - [{ value, label }]
//   onChange - (value) => void
export default function DropDown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-[90px] items-center justify-between gap-2 rounded border border-black/15 bg-white px-2 py-1 text-sm text-navy dark:border-white/20 dark:bg-navy dark:text-white"
      >
        {selected?.label ?? "Select"}
        <FaChevronDown className="text-xs" />
      </button>

      {open && (
        <ul className="absolute right-0 z-10 mt-1 min-w-full overflow-hidden rounded border border-black/15 bg-white text-sm text-navy shadow-lg dark:border-white/20 dark:bg-navy dark:text-white">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`block w-full px-3 py-1.5 text-left hover:bg-black/5 dark:hover:bg-white/10 ${
                  option.value === value ? "font-semibold text-purple" : ""
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
