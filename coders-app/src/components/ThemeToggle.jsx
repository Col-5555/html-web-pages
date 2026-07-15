import { useDispatch, useSelector } from "react-redux";
import { BsSun, BsMoonStars } from "react-icons/bs";
import { toggleTheme } from "../redux/themeSlice";

// A sun/moon button that flips the Redux theme. In light mode it shows a moon
// (click to go dark); in dark mode a sun (click to go light).
export default function ThemeToggle() {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="rounded-full p-2 text-xl text-navy transition hover:bg-black/10 dark:text-white dark:hover:bg-white/10"
    >
      {mode === "light" ? <BsMoonStars /> : <BsSun />}
    </button>
  );
}
