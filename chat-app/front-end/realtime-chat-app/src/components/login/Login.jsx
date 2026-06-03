import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { initiateSocket } from "../../socket";

export default function Login({ error, setError, errorText, setErrorText }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const visibility = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="#e3e3e3"
    >
      <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
    </svg>
  );

  const visibilityOff = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 -960 960 960"
      width="24px"
      fill="#e3e3e3"
    >
      <path d="m644-428-58-58q9-47-27-88t-93-32l-58-58q17-8 34.5-12t37.5-4q75 0 127.5 52.5T660-500q0 20-4 37.5T644-428Zm128 126-58-56q38-29 67.5-63.5T832-500q-50-101-143.5-160.5T480-720q-29 0-57 4t-55 12l-62-62q41-17 84-25.5t90-8.5q151 0 269 83.5T920-500q-23 59-60.5 109.5T772-302Zm20 246L624-222q-35 11-70.5 16.5T480-200q-151 0-269-83.5T40-500q21-53 53-98.5t73-81.5L56-792l56-56 736 736-56 56ZM222-624q-29 26-53 57t-41 67q50 101 143.5 160.5T480-280q20 0 39-2.5t39-5.5l-36-38q-11 3-21 4.5t-21 1.5q-75 0-127.5-52.5T300-500q0-11 1.5-21t4.5-21l-84-82Zm319 93Zm-151 75Z" />
    </svg>
  );

  const showToast = (text) => {
    setErrorText(text);
    setError(true);

    setTimeout(() => {
      setError(false);
      setErrorText("");
    }, 3000);
  };

  const handleLoginForm = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const userLogin = Object.fromEntries(form.entries());

    try {
      const res = await axios.post("/api/login", userLogin, {
        withCredentials: true,
      });

      if (res.data.message === "Success") {
        localStorage.setItem("token", res.data.token);
        initiateSocket(res.data.token);
        navigate("/");
      }
    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Email and password incorrect!";
      showToast(errMsg);
    }
  };

  return (
    <>
      {error && (
        <div className="w-svw absolute z-10 flex justify-center items-center top-6">
          <Alert
            severity="error"
            variant="filled"
            onClose={() => {
              setError(false);
            }}
          >
            <AlertTitle>Error</AlertTitle>
            <span>{errorText}</span>
          </Alert>
        </div>
      )}
      <div className="drawer lg:drawer-open bg-base-300 flex justify-center">
        <div className="flex justify-center items-center h-screen">
          <form onSubmit={handleLoginForm}>
            <fieldset className="fieldset bg-base-100 border-neutral-700 rounded-box w-lg border p-4">
              <legend className="fieldset-legend font-bold">Login</legend>

              <label className="label">Email</label>
              <input
                type="email"
                className="input w-lg"
                placeholder="Email"
                name="email"
                autoComplete="false"
                required
              />

              <label className="label">Password</label>
              <span className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-lg pr-10"
                  placeholder="Password"
                  name="password"
                  autoComplete="false"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 cursor-pointer z-10 tooltip tooltip-bottom"
                  data-tip={showPassword ? "Hide password" : "Show Password"}
                >
                  {showPassword ? visibilityOff : visibility}
                </button>
              </span>

              <button type="submit" className="btn btn-neutral mt-4">
                Login
              </button>

              <p className="flex justify-center">
                Don't have an account? &nbsp;
                <span className="cursor-pointer font-bold text-blue-500">
                  <Link to="/register">Sign Up</Link>
                </span>
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    </>
  );
}
