import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "../components/AuthLayout";
import { login } from "../redux/authSlice";
import { signIn } from "../api/auth";

const inputClasses =
  "p-3.5 bg-navy border-none rounded-lg text-light text-sm outline-none placeholder:text-[#a0a0b0]";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sign-in page. Task 6 asks us to validate this form using plain React state
// (no external form library), so we keep the field values and any error
// messages in useState and validate on submit.
export default function SignIn() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const user = await signIn({ email: values.email });
    dispatch(login(user));
    navigate("/");
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

        <button
          type="submit"
          className="cursor-pointer rounded-lg border-none bg-skyblue p-3.5 text-base font-bold text-light"
        >
          Login
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
