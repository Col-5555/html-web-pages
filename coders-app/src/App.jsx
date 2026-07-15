import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Workspace from "./pages/Workspace";
import ProtectedRoute from "./components/ProtectedRoute";

// Application routes.
//   /signin, /signup        -> public authentication pages
//   /, /challenges          -> protected home (challenges list)
//   /leaderboard, /profile  -> protected placeholders (built later)
//   *                       -> anything else falls back to sign-in
export default function App() {
  const themeMode = useSelector((state) => state.theme.mode);

  // Keep the <html> `dark` class in sync with the Redux theme so Tailwind's
  // `dark:` variants apply across the whole app.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeMode === "dark");
  }, [themeMode]);

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/challenges" element={<Home />} />
        <Route path="/workspace/:challengeId" element={<Workspace />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
