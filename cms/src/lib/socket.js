import { io } from "socket.io-client";

console.log("Creating socket connection to http://localhost:3000");

export const socket = io("http://localhost:3000", {
  autoConnect: false,
  transports: ["websocket"],
});

socket.on("connect_error", (err) => {
  console.error("Socket IO Error:", err);
});
