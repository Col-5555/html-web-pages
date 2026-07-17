"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Client-side auth guard. Auth lives in client Redux, rehydrated from the token
// cookie in providers. The decision is deferred until after mount so the server
// and the first client render agree (both render nothing) — avoiding a hydration
// mismatch — after which unauthenticated managers are redirected to /signin.
export default function AuthGuard({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace("/signin");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null;
  }

  return children;
}
