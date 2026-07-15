"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import AuthShell from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/redux/authSlice";
import { signIn } from "@/lib/api/auth";
import { signinSchema } from "@/schemas/authSchemas";

// Managers sign-in page. Validated with react-hook-form + zod (email valid,
// password >= 6). On success, records the manager in Redux and goes to the
// dashboard.
export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signinSchema) });
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = async (data) => {
    const user = await signIn(data);
    dispatch(login(user));
    router.push("/");
  };

  return (
    <AuthShell>
      <h2 className="mb-6 text-lg font-semibold">Join Managers Now!</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <Input type="email" placeholder="Email" {...register("email")} />
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          Login
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        New to CodeCLA.{" "}
        <Link href="/signup" className="font-medium text-primary">
          Signup
        </Link>
      </p>
    </AuthShell>
  );
}
