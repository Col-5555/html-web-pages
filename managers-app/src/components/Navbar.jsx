"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { logout } from "@/redux/authSlice";

// Dashboard navbar: a link to the challenges home and a Logout button.
export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/signin");
  };

  return (
    <nav className="flex items-center justify-between border-b bg-background px-6 py-3">
      <Link href="/" className="font-semibold">
        Challenges
      </Link>
      <Button variant="secondary" size="sm" onClick={handleLogout}>
        Logout
      </Button>
    </nav>
  );
}
