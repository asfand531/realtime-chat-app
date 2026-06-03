import { io } from "socket.io-client";

let socket = null;

export const initiateSocket = (token) => {
  if (socket && socket.connected) return;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io("http://localhost:4000", {
    auth: { token },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:" /*,socket.id*/);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
