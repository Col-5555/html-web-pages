"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/api/auth";
import { signupSchema } from "@/schemas/authSchemas";

// Managers sign-up page. Validated with react-hook-form + zod. On success the
// manager is registered (unverified) and sent to sign-in — the Express backend
// emails a verification link that must be clicked before the first login.
// Backend errors (e.g. duplicate email) are surfaced as a toast.
export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      await signUp(data);
      toast.success("Account created — check your email to verify, then sign in.");
      router.push("/signin");
    } catch (err) {
      toast.error(err.message || "Sign up failed");
    }
  };

  const fieldError = (name) =>
    errors[name] && (
      <p className="mt-1 text-sm text-destructive">{errors[name].message}</p>
    );

  return (
    <AuthShell>
      <h2 className="mb-6 text-lg font-semibold">Join Managers Now!</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <Input type="text" placeholder="First name" {...register("firstName")} />
          {fieldError("firstName")}
        </div>
        <div>
          <Input type="text" placeholder="Last name" {...register("lastName")} />
          {fieldError("lastName")}
        </div>
        <div>
          <Input type="email" placeholder="Email" {...register("email")} />
          {fieldError("email")}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {fieldError("password")}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
