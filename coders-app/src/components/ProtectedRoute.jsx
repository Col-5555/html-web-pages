import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Guards routes that require authentication. If the coder is signed in, the
// nested route (via <Outlet />) is rendered; otherwise they are redirected to
// the sign-in page. `replace` stops the guarded URL from polluting history.
export default function ProtectedRoute() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
