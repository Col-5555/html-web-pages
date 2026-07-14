import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

// Placeholder for the protected home page. Reaching it at all proves the
// ProtectedRoute guard let us through. Later assignments replace this with the
// real challenges list. For now it just greets the coder and offers a logout
// button so the auth flow can be exercised end-to-end.
export default function Home() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-appbg-light font-martel text-navy">
      <h1 className="text-3xl font-bold text-purple">
        Welcome{user?.email ? `, ${user.email}` : ""}!
      </h1>
      <p className="text-navy">You are signed in to Coders.</p>
      <button
        type="button"
        onClick={() => dispatch(logout())}
        className="cursor-pointer rounded-lg border-none bg-skyblue px-6 py-3 font-bold text-light"
      >
        Log out
      </button>
    </main>
  );
}
