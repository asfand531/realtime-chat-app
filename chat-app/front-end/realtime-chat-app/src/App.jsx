import { useEffect, useState } from "react";
import User from "./components/users/User";
import Login from "./components/login/Login";
import Register from "./components/login/Register";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

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

  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:4000");
  //   ws.addEventListener("open", () => {
  //     console.log("Connected");
  //   });
  //   ws.addEventListener("message", (e) => {
  //     console.log(e);
  //   });
  //   ws.addEventListener("error", (e) => {
  //     console.log(e);
  //   });
  //   ws.addEventListener("close", (e) => {
  //     ws.close();
  //   });
  //   ws.send("");
  // }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
