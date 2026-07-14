import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "../components/AuthLayout";
import { login } from "../redux/authSlice";
import { signUp } from "../api/auth";
import { signupSchema } from "../schemas/signupSchema";

const inputClasses =
  "p-3.5 bg-navy border-none rounded-lg text-light text-sm outline-none placeholder:text-[#a0a0b0]";

// Sign-up page. Task 6 asks us to validate this form with react-hook-form and
// zod: useForm registers the inputs, the zodResolver runs `signupSchema` on
// submit, and `errors` carries any messages produced by the schema.
export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const user = await signUp(data);
    dispatch(login(user));
    navigate("/");
  };

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

        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg border-none bg-skyblue p-3.5 text-base font-bold text-light disabled:opacity-70"
        >
          Sign Up
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
