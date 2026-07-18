import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// Guards routes that require authentication. If the coder is signed in, the
// nested route (via <Outlet />) is rendered; otherwise they are redirected to
// the sign-in page. `replace` stops the guarded URL from polluting history.
export default function ProtectedRoute() {
  // The JWT is the source of truth: present means signed in. It is attached to
  // API requests and cleared on logout / 401, so guarding on it keeps the UI in
  // step with what the backend will actually accept.
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}
