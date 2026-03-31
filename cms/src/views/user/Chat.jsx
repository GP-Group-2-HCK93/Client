import { useEffect, useState } from "react";
import { socket } from "../../lib/socket";

export default function Chat() {
  const [messageSent, setMessageSent] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const savedUsername =
    localStorage.getItem("username") ||
    localStorage.getItem("name") ||
    localStorage.getItem("email");
  const username = savedUsername || `guest-${Date.now()}`;

  function handleSubmit(e) {
    e.preventDefault();
    const msg = messageSent.trim();
    if (!msg) return;

    if (!isConnected) {
      console.error("Socket not connected yet");
      return;
    }

    console.log("Sending:", msg);
    socket.emit("msg/sent", msg);
    setMessageSent("");
  }
  // Setup socket connectionf
  useEffect(() => {
    if (!savedUsername) localStorage.setItem("username", username);

    socket.auth = { username };

    socket.on("connect", () => {
      console.log("✅ Socket connected! ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
      setIsConnected(false);
    });

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, [username, savedUsername]);

  // Listen pesan
  useEffect(() => {
    const onMessage = (payload) => {
      console.log("📨 Received:", payload);
      setMessages((prev) => [...prev, payload]);
    };

    socket.on("msg/all", onMessage);

    return () => {
      socket.off("msg/all", onMessage);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-base-200 text-gray-800 p-10">
      <div className="flex flex-col grow w-full max-w-xl bg-base-100 shadow-xl rounded-lg overflow-hidden">
        <div className="flex flex-col grow h-0 p-4 overflow-auto">
          {messages.map((el, idx) => (
            <div
              className={`chat ${el.from === username ? "chat-end" : "chat-start"} flex flex-col`}
              key={idx}
            >
              <div>{el.from === username ? "You" : el.from}</div>
              <div className="chat-bubble chat-bubble-accent">{el.msg}</div>
            </div>
          ))}
        </div>

        <form className="bg-accent p-4 flex flex-row" onSubmit={handleSubmit}>
          <input
            value={messageSent}
            onChange={(e) => setMessageSent(e.target.value)}
            className="flex items-center w-full rounded px-3"
            type="text"
            placeholder="Type your message…"
            disabled={!isConnected}
          />
          <button
            className="btn btn-base-100 ml-4"
            type="submit"
            disabled={!isConnected}
          >
            {isConnected ? "Send" : "Connecting..."}
          </button>
        </form>
      </div>
    </div>
  );
}
