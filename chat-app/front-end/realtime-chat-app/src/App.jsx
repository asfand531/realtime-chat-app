import { useState } from "react";
import User from "./components/users/User";
import Login from "./components/login/Login";
import Register from "./components/login/Register";
import { BrowserRouter, Routes, Route } from "react-router";

export default function App() {
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
            path="/"
            element={
              <Login tooltip={tooltip} handleDrawerClick={handleDrawerClick} />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                tooltip={tooltip}
                handleDrawerClick={handleDrawerClick}
              />
            }
          />
          <Route
            path="/user"
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
