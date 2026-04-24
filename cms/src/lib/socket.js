import { io } from "socket.io-client";
import { url } from "../constants/url";

console.log(`Creating socket connection to ${url}`);

export const socket = io(url, {
  autoConnect: false,
  transports: ["websocket"],
});

socket.on("connect_error", (err) => {
  console.error("Socket IO Error:", err);
});
