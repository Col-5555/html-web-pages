import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";
import ThemeToggle from "./ThemeToggle";
import logo from "../assets/logo.svg";

// The top navigation bar shared by every signed-in page: logo + section links
// on the left; theme toggle, avatar, name, and a Profile/Logout dropdown on the
// right.
export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName}`
    : (user?.email ?? "Coder");

  // Close the dropdown when clicking anywhere outside it.
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin");
  };

  const linkClasses = "hover:text-purple";

  return (
    <nav className="flex items-center justify-between bg-navbar-light px-6 py-3 text-navy dark:bg-navbar-dark dark:text-white">
      {/* Left: logo + section links */}
      <div className="flex items-center gap-6">
        <Link to="/challenges" className="flex items-center gap-2 font-bold">
          <img src={logo} alt="CodeCla logo" className="h-6 w-6" />
          CodeCla
        </Link>
        <Link to="/challenges" className={linkClasses}>
          Challenges
        </Link>
        <Link to="/leaderboard" className={linkClasses}>
          Leaderboard
        </Link>
      </div>

      {/* Right: theme toggle + profile dropdown */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2"
          >
            <img
              src="https://i.pravatar.cc/80?img=12"
              alt="Your avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden sm:inline">{displayName}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-lg bg-white text-navy shadow-lg dark:bg-navy dark:text-white">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
