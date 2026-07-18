import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "../components/AuthLayout";
import { login } from "../redux/authSlice";
import { useLoginMutation } from "../redux/api";

const inputClasses =
  "p-3.5 bg-navy border-none rounded-lg text-light text-sm outline-none placeholder:text-[#a0a0b0]";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-in page. Client-side validation stays in useState (per the earlier task);
// on submit we call the real backend via useLoginMutation, store the returned
// { user, token } in Redux, and land on Home. Auth errors from the API — 401 for
// bad credentials, 403 for an unverified email — are surfaced to the user.
export default function SignIn() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loginRequest, { isLoading }] = useLoginMutation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!values.email) {
      nextErrors.email = "Email is required";
    } else if (!emailPattern.test(values.email)) {
      nextErrors.email = "Enter a valid email";
    }
    if (!values.password) {
      nextErrors.password = "Password is required";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { user, token } = await loginRequest(values).unwrap();
      dispatch(login({ user, token }));
      navigate("/");
    } catch (err) {
      // RTK Query surfaces the HTTP status on err.status and the JSON body on
      // err.data. Prefer the backend's message (covers 401 bad creds and 403
      // unverified email); fall back to a generic message otherwise.
      setFormError(
        err?.data?.message ??
          "Could not sign you in. Please try again."
      );
    }
  };

  return (
    <AuthLayout>
      <h2 className="mb-8 text-2xl text-purple">Join Coders Now!</h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1 text-left">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={values.email}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-left">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            className={inputClasses}
          />
          {errors.password && (
            <span className="text-xs text-red-500">{errors.password}</span>
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
          {isLoading ? "Signing in…" : "Login"}
        </button>
      </form>
      <p className="mt-5 text-sm text-navy">
        New to CodeCLA.{" "}
        <Link to="/signup" className="font-semibold text-purple no-underline">
          Signup
        </Link>
      </p>
    </AuthLayout>
  );
}
