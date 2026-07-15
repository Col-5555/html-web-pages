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
import { signUp } from "@/lib/api/auth";
import { signupSchema } from "@/schemas/authSchemas";

// Managers sign-up page. Validated with react-hook-form + zod (names >= 2, valid
// email, password >= 6). On success, records the manager in Redux and goes to
// the dashboard.
export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = async (data) => {
    const user = await signUp(data);
    dispatch(login(user));
    router.push("/");
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
          Login
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
