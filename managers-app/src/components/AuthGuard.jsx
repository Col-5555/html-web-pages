"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// Client-side auth guard. Wraps authenticated pages and redirects to /signin
// when the manager isn't signed in. Because auth lives in client Redux (no
// cookie/session), this guard runs on the client; the wrapped Server Component
// content is passed through as `children`.
export default function AuthGuard({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
