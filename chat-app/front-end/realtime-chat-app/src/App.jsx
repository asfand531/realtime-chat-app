import { useState } from "react";
import User from "./components/users/User";
import Login from "./components/login/Login";
import Register from "./components/login/Register";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

export default function App() {
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [tooltip, setTooltip] = useState("Close");
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleDrawer = () => {
    setTooltip(isDrawerOpen ? "Open" : "Close");
  };

  const handleDrawerClick = () => {
    setIsDrawerOpen((prev) => !prev);
    handleDrawer();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                error={error}
                setError={setError}
                errorText={errorText}
                setErrorText={setErrorText}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                error={error}
                setError={setError}
                errorText={errorText}
                setErrorText={setErrorText}
              />
            }
          />
          <Route
            path="/"
            element={
              <User
                search={search}
                setSearch={setSearch}
                tooltip={tooltip}
                handleDrawerClick={handleDrawerClick}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
