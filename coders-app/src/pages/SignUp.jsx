import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useRegisterMutation } from "../redux/api";
import { signupSchema } from "../schemas/signupSchema";

const inputClasses =
  "p-3.5 bg-navy border-none rounded-lg text-light text-sm outline-none placeholder:text-[#a0a0b0]";

// Sign-up page. react-hook-form + zod validate the fields (per the earlier task);
// on submit we register against the backend. Registration does NOT log the user
// in — the account is created unverified and must confirm its email first — so on
// success we show a "check your email" notice (plus the dev Ethereal preview
// link) and point them to the sign-in page rather than navigating into the app.
export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signupSchema) });
  const [registerRequest, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(null); // { message, emailPreviewUrl }

  const onSubmit = async (data) => {
    setFormError("");
    try {
      // The backend expects snake_case names.
      const result = await registerRequest({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        password: data.password,
      }).unwrap();
      setSuccess({
        message: result.message,
        emailPreviewUrl: result.emailPreviewUrl,
      });
    } catch (err) {
      // e.g. 409 when the email already exists.
      setFormError(
        err?.data?.message ?? "Could not create your account. Please try again."
      );
    }
  };

  // After a successful registration, replace the form with a confirmation notice.
  if (success) {
    return (
      <AuthLayout>
        <h2 className="mb-4 text-2xl text-purple">Almost there!</h2>
        <p className="mb-4 text-sm text-navy">
          Check your email to verify your account before signing in.
        </p>
        {success.emailPreviewUrl && (
          <p className="mb-4 text-sm text-navy">
            Dev preview:{" "}
            <a
              href={success.emailPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-purple underline"
            >
              open verification email
            </a>
          </p>
        )}
        <Link
          to="/signin"
          className="font-semibold text-purple no-underline"
        >
          Go to Login
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="mb-8 text-2xl text-purple">Join Coders Now!</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-left">
          <input
            type="text"
            placeholder="First Name"
            className={inputClasses}
            {...register("firstName")}
          />
          {errors.firstName && (
            <span className="text-xs text-red-500">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <input
            type="text"
            placeholder="Last Name"
            className={inputClasses}
            {...register("lastName")}
          />
          {errors.lastName && (
            <span className="text-xs text-red-500">
              {errors.lastName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <input
            type="email"
            placeholder="Email"
            className={inputClasses}
            {...register("email")}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <input
            type="password"
            placeholder="Password"
            className={inputClasses}
            {...register("password")}
          />
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        {formError && (
          <span className="text-sm text-red-500">{formError}</span>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="cursor-pointer rounded-lg border-none bg-skyblue p-3.5 text-base font-bold text-light disabled:opacity-70"
        >
          {isLoading ? "Creating account…" : "Sign Up"}
        </button>
      </form>
      <p className="mt-5 text-sm text-navy">
        Already have an account?.{" "}
        <Link to="/signin" className="font-semibold text-purple no-underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
