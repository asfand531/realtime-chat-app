import axios from "axios";
import { Fragment, useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [registerUser, setRegisterUser] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSignUpForm = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const registerData = Object.fromEntries(form.entries());
    console.log("User Register Data: ", registerData);

    try {
      const response = await axios.post("/api/sign_up", form, {
        headers: { "Content-Type": "application/json" },
      });

      setRegisterUser((prev) => [...prev, response.data]);
    } catch (error) {
      console.log(error);
    }
  };

  const formValues = [
    {
      label: "Name",
      type: "text",
      name: "name",
    },
    {
      label: "Phone Number",
      type: "tel",
      name: "phone_no",
    },
    {
      label: "Email",
      type: "email",
      name: "email",
    },
  ];

  return (
    <>
      <div className="drawer lg:drawer-open bg-base-300 flex justify-center">
        <div className="flex justify-center items-center h-screen">
          <form onSubmit={handleSignUpForm}>
            <fieldset className="fieldset bg-base-100 border-neutral-700 rounded-box w-lg border p-4">
              <legend className="fieldset-legend font-bold">Sign Up</legend>
              {formValues.map((f, i) => {
                const { label, type, name } = f;
                return (
                  <Fragment key={i}>
                    <label className="label">{label}</label>
                    <input
                      type={type}
                      className="input w-lg"
                      placeholder={label}
                      name={name}
                      autoComplete="false"
                      required={true}
                    />
                  </Fragment>
                );
              })}

              <label className="label">Password</label>
              <span className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input w-lg pr-10 `}
                  placeholder="Password"
                  name="password"
                  autoComplete="false"
                  required={true}
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
                Sign Up
              </button>

              <p className="flex justify-center">
                Already have an account? &nbsp;
                <span className="cursor-pointer font-bold text-blue-500">
                  <Link to="/login"> Login</Link>
                </span>
              </p>
            </fieldset>
          </form>
        </div>
      </div>
    </>
  );
}
