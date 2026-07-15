"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

// The dashboard home. For Phase 1 it's a guarded placeholder: unauthenticated
// visitors are bounced to /signin. Phase 2 replaces the body with the navbar and
// the challenges table. (A reusable guard will be factored out then.)
export default function Home() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
      <h1 className="text-2xl font-bold">Your challenges</h1>
      <p className="text-muted-foreground">
        Signed in{user?.email ? ` as ${user.email}` : ""}. The dashboard table
        arrives in the next phase.
      </p>
    </main>
  );
}
